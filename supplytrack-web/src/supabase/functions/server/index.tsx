import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "../../kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Health check endpoint
app.get("/make-server-ec6a43ca/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth helper function
async function getAuthenticatedUser(c: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken || accessToken === 'Bearer') {
    return null;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }

  return user;
}

// Initialize waste types
app.post("/make-server-ec6a43ca/init", async (c) => {
  try {
    // Initialize waste types
    const wasteTypes = [
      { id: 'papel', name: 'Papel', points_per_kg: 10, color: '#3B82F6' },
      { id: 'plastico', name: 'Plástico', points_per_kg: 15, color: '#10B981' },
      { id: 'vidro', name: 'Vidro', points_per_kg: 20, color: '#F59E0B' },
      { id: 'metal', name: 'Metal', points_per_kg: 25, color: '#EF4444' },
      { id: 'organico', name: 'Orgânico', points_per_kg: 5, color: '#8B5CF6' },
      { id: 'eletronico', name: 'Eletrônico', points_per_kg: 50, color: '#EC4899' },
      { id: 'pilha', name: 'Pilhas/Baterias', points_per_kg: 100, color: '#6B7280' },
      { id: 'oleo', name: 'Óleo de Cozinha', points_per_kg: 30, color: '#F97316' }
    ];

    for (const wasteType of wasteTypes) {
      await kv.set(`waste_type:${wasteType.id}`, wasteType);
    }

    // Initialize reward types
    const rewards = [
      { id: 'desconto_5', name: 'Desconto 5% Mensalidade', points_required: 500, type: 'discount', value: 5 },
      { id: 'desconto_10', name: 'Desconto 10% Mensalidade', points_required: 1000, type: 'discount', value: 10 },
      { id: 'horas_comp_2', name: '2 Horas Complementares', points_required: 300, type: 'hours', value: 2 },
      { id: 'horas_comp_5', name: '5 Horas Complementares', points_required: 600, type: 'hours', value: 5 },
      { id: 'horas_comp_10', name: '10 Horas Complementares', points_required: 1200, type: 'hours', value: 10 },
      { id: 'brinde_ecobag', name: 'Ecobag USCS', points_required: 200, type: 'item', value: 1 },
      { id: 'brinde_squeeze', name: 'Squeeze Sustentável', points_required: 400, type: 'item', value: 1 },
      { id: 'certificado', name: 'Certificado Sustentabilidade', points_required: 800, type: 'certificate', value: 1 }
    ];

    for (const reward of rewards) {
      await kv.set(`reward:${reward.id}`, reward);
    }

    return c.json({ success: true, message: "Sistema inicializado com sucesso" });
  } catch (error) {
    console.error('Erro ao inicializar sistema:', error);
    return c.json({ error: 'Erro ao inicializar sistema' }, 500);
  }
});

// User registration
app.post("/make-server-ec6a43ca/register", async (c) => {
  try {
    const { email, password, name, ra, course, user_type } = await c.req.json();

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, ra, course, user_type },
      email_confirm: true // Automatically confirm email since email server hasn't been configured
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return c.json({ error: 'Erro ao criar usuário: ' + error.message }, 400);
    }

    // Store additional user data in KV store
    const userData = {
      id: data.user.id,
      email,
      name,
      ra,
      course,
      user_type,
      points: 0,
      total_deliveries: 0,
      total_weight: 0,
      created_at: new Date().toISOString(),
      badges: []
    };

    await kv.set(`user:${data.user.id}`, userData);
    await kv.set(`user_ra:${ra}`, data.user.id);

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.error('Erro no registro:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get user profile
app.get("/make-server-ec6a43ca/profile", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get waste types
app.get("/make-server-ec6a43ca/waste-types", async (c) => {
  try {
    const wasteTypes = await kv.getByPrefix('waste_type:');
    return c.json({ waste_types: wasteTypes });
  } catch (error) {
    console.error('Erro ao buscar tipos de resíduos:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Create pre-delivery registration
app.post("/make-server-ec6a43ca/pre-delivery", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const { waste_items, notes } = await c.req.json();

    const userData = await kv.get(`user:${user.id}`);
    if (userData.user_type !== 'student') {
      return c.json({ error: 'Apenas alunos podem fazer pré-cadastros' }, 403);
    }

    const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const delivery = {
      id: deliveryId,
      user_id: user.id,
      waste_items,
      notes: notes || '',
      status: 'pending_delivery',
      created_at: new Date().toISOString(),
      expected_points: 0
    };

    // Calculate expected points
    for (const item of waste_items) {
      const wasteType = await kv.get(`waste_type:${item.waste_type_id}`);
      if (wasteType) {
        delivery.expected_points += wasteType.points_per_kg * item.estimated_weight;
      }
    }

    await kv.set(`delivery:${deliveryId}`, delivery);
    await kv.set(`user_delivery:${user.id}:${deliveryId}`, deliveryId);

    return c.json({ success: true, delivery });
  } catch (error) {
    console.error('Erro ao criar pré-cadastro:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get user deliveries
app.get("/make-server-ec6a43ca/deliveries", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const deliveryIds = await kv.getByPrefix(`user_delivery:${user.id}:`);
    const deliveries = [];

    for (const deliveryId of deliveryIds) {
      const delivery = await kv.get(`delivery:${deliveryId}`);
      if (delivery) {
        deliveries.push(delivery);
      }
    }

    deliveries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ deliveries });
  } catch (error) {
    console.error('Erro ao buscar entregas:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get pending deliveries for staff
app.get("/make-server-ec6a43ca/pending-deliveries", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const userData = await kv.get(`user:${user.id}`);
    if (userData.user_type !== 'staff') {
      return c.json({ error: 'Apenas funcionários podem acessar esta rota' }, 403);
    }

    const allDeliveries = await kv.getByPrefix('delivery:');
    const pendingDeliveries = allDeliveries.filter(delivery =>
      delivery.status === 'pending_delivery'
    );

    // Get user data for each delivery
    for (const delivery of pendingDeliveries) {
      const deliveryUser = await kv.get(`user:${delivery.user_id}`);
      delivery.user_info = deliveryUser;
    }

    pendingDeliveries.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return c.json({ deliveries: pendingDeliveries });
  } catch (error) {
    console.error('Erro ao buscar entregas pendentes:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Validate delivery
app.post("/make-server-ec6a43ca/validate-delivery", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const userData = await kv.get(`user:${user.id}`);
    if (userData.user_type !== 'staff') {
      return c.json({ error: 'Apenas funcionários podem validar entregas' }, 403);
    }

    const { delivery_id, actual_waste_items, notes } = await c.req.json();

    const delivery = await kv.get(`delivery:${delivery_id}`);
    if (!delivery) {
      return c.json({ error: 'Entrega não encontrada' }, 404);
    }

    // Calculate actual points
    let actualPoints = 0;
    for (const item of actual_waste_items) {
      const wasteType = await kv.get(`waste_type:${item.waste_type_id}`);
      if (wasteType) {
        actualPoints += wasteType.points_per_kg * item.actual_weight;
      }
    }

    // Update delivery
    delivery.status = 'validated';
    delivery.actual_waste_items = actual_waste_items;
    delivery.actual_points = actualPoints;
    delivery.validated_by = user.id;
    delivery.validated_at = new Date().toISOString();
    delivery.validation_notes = notes || '';

    await kv.set(`delivery:${delivery_id}`, delivery);

    // Update user points and stats
    const deliveryUser = await kv.get(`user:${delivery.user_id}`);
    deliveryUser.points += actualPoints;
    deliveryUser.total_deliveries += 1;

    // Calculate total weight
    const totalWeight = actual_waste_items.reduce((sum, item) => sum + item.actual_weight, 0);
    deliveryUser.total_weight += totalWeight;

    await kv.set(`user:${delivery.user_id}`, deliveryUser);

    // Create points history entry
    const pointsEntry = {
      id: `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: delivery.user_id,
      delivery_id,
      points: actualPoints,
      type: 'delivery',
      created_at: new Date().toISOString()
    };

    await kv.set(`points:${pointsEntry.id}`, pointsEntry);

    return c.json({ success: true, delivery, points_awarded: actualPoints });
  } catch (error) {
    console.error('Erro ao validar entrega:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get ranking
app.get("/make-server-ec6a43ca/ranking", async (c) => {
  try {
    const allUsers = await kv.getByPrefix('user:');
    const students = allUsers.filter(user => user.user_type === 'student');

    students.sort((a, b) => b.points - a.points);

    const ranking = students.slice(0, 20).map((user, index) => ({
      position: index + 1,
      name: user.name,
      course: user.course,
      points: user.points,
      total_deliveries: user.total_deliveries,
      total_weight: user.total_weight
    }));

    return c.json({ ranking });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get rewards
app.get("/make-server-ec6a43ca/rewards", async (c) => {
  try {
    const rewards = await kv.getByPrefix('reward:');
    return c.json({ rewards });
  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Redeem reward
app.post("/make-server-ec6a43ca/redeem-reward", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const { reward_id } = await c.req.json();

    const userData = await kv.get(`user:${user.id}`);
    const reward = await kv.get(`reward:${reward_id}`);

    if (!reward) {
      return c.json({ error: 'Recompensa não encontrada' }, 404);
    }

    if (userData.points < reward.points_required) {
      return c.json({ error: 'Pontos insuficientes' }, 400);
    }

    // Deduct points
    userData.points -= reward.points_required;
    await kv.set(`user:${user.id}`, userData);

    // Create redemption record
    const redemption = {
      id: `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      reward_id,
      reward_name: reward.name,
      points_spent: reward.points_required,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await kv.set(`redemption:${redemption.id}`, redemption);
    await kv.set(`user_redemption:${user.id}:${redemption.id}`, redemption.id);

    // Create points history entry
    const pointsEntry = {
      id: `points_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      redemption_id: redemption.id,
      points: -reward.points_required,
      type: 'redemption',
      created_at: new Date().toISOString()
    };

    await kv.set(`points:${pointsEntry.id}`, pointsEntry);

    return c.json({ success: true, redemption, remaining_points: userData.points });
  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get dashboard stats
app.get("/make-server-ec6a43ca/dashboard-stats", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: 'Não autorizado' }, 401);
  }

  try {
    const userData = await kv.get(`user:${user.id}`);

    if (userData.user_type === 'student') {
      // Student stats
      const allUsers = await kv.getByPrefix('user:');
      const students = allUsers.filter(u => u.user_type === 'student');
      students.sort((a, b) => b.points - a.points);

      const userRank = students.findIndex(u => u.id === user.id) + 1;

      return c.json({
        user_stats: userData,
        rank: userRank,
        total_students: students.length
      });
    } else {
      // Staff stats
      const allDeliveries = await kv.getByPrefix('delivery:');
      const today = new Date().toDateString();

      const pendingCount = allDeliveries.filter(d => d.status === 'pending_delivery').length;
      const todayValidated = allDeliveries.filter(d =>
        d.status === 'validated' &&
        d.validated_by === user.id &&
        new Date(d.validated_at).toDateString() === today
      ).length;

      return c.json({
        user_stats: userData,
        pending_deliveries: pendingCount,
        today_validated: todayValidated
      });
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

Deno.serve(app.fetch);
