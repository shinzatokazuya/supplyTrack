/**
 * SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
 *
 * Este arquivo cria todas as tabelas necessárias e insere dados iniciais
 * para você poder testar o sistema imediatamente.
 *
 * Execute este arquivo UMA VEZ antes de iniciar o servidor pela primeira vez:
 * node backend/db/init-database.js
 */

import { openDb } from './connection.js';

async function inicializarBancoDeDados() {
    console.log('🚀 Iniciando criação do banco de dados...');

    try {
        const db = await openDb();

        // Ativa as foreign keys (chaves estrangeiras) no SQLite
        await db.exec('PRAGMA foreign_keys = ON;');

        console.log('📊 Criando tabelas...');

        // ============================================
        // TABELA DE CAMPUS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS campi (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                cidade TEXT NOT NULL,
                estado TEXT NOT NULL,
                uf TEXT NOT NULL
            );
        `);
        console.log('✅ Tabela campi criada');

        // ============================================
        // TABELA DE CURSOS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS cursos (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                sigla TEXT
            );
        `);
        console.log('✅ Tabela cursos criada');

        // ============================================
        // TABELA DE USUÁRIOS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS usuarios (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                ra TEXT UNIQUE,
                curso_id INTEGER,
                campus_id INTEGER,
                tipo_usuario TEXT CHECK (tipo_usuario IN ('estudante','voluntario','admin')),
                senha TEXT NOT NULL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES cursos(ID),
                FOREIGN KEY (campus_id) REFERENCES campi(ID)
            );
        `);
        console.log('✅ Tabela usuarios criada');

        // ============================================
        // TABELA DE TIPOS DE RESÍDUOS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tipos_residuos (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                pontos REAL NOT NULL,
                cor TEXT
            );
        `);
        console.log('✅ Tabela tipos_residuos criada');

        // ============================================
        // TABELA DE ENTREGAS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS entregas (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                status TEXT CHECK (status IN ('pendente','validado','rejeitado')) NOT NULL DEFAULT 'pendente',
                avisos TEXT,
                pontos_esperados REAL,
                pontos_recebidos REAL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                validado_por INTEGER,
                validado_em TEXT,
                avisos_validacao TEXT,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(ID),
                FOREIGN KEY (validado_por) REFERENCES usuarios(ID)
            );
        `);
        console.log('✅ Tabela entregas criada');

        // ============================================
        // TABELA DE ITENS DE ENTREGA
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS itens_entrega (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                entrega_id INTEGER NOT NULL,
                tipo_residuo_id INTEGER NOT NULL,
                peso_estimado REAL,
                peso_atual REAL,
                FOREIGN KEY (entrega_id) REFERENCES entregas(ID),
                FOREIGN KEY (tipo_residuo_id) REFERENCES tipos_residuos(ID)
            );
        `);
        console.log('✅ Tabela itens_entrega criada');

        // ============================================
        // TABELA DE RECOMPENSAS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS recompensas (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                pontos_necessarios INTEGER NOT NULL,
                tipo TEXT CHECK (tipo IN ('desconto','item','horas','comprovante')) NOT NULL
            );
        `);
        console.log('✅ Tabela recompensas criada');

        // ============================================
        // TABELA DE HISTÓRICO DE RECOMPENSAS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS historico_recompensa (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                recompensa_id INTEGER NOT NULL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(ID),
                FOREIGN KEY (recompensa_id) REFERENCES recompensas(ID)
            );
        `);
        console.log('✅ Tabela historico_recompensa criada');

        // ============================================
        // TABELA DE MEDALHAS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS medalhas (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                icone TEXT
            );
        `);
        console.log('✅ Tabela medalhas criada');

        // ============================================
        // TABELA DE MEDALHAS DOS USUÁRIOS
        // ============================================
        await db.exec(`
            CREATE TABLE IF NOT EXISTS usuario_medalhas (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                medalha_id INTEGER NOT NULL,
                recebido_em TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(ID),
                FOREIGN KEY (medalha_id) REFERENCES medalhas(ID)
            );
        `);
        console.log('✅ Tabela usuario_medalhas criada');

        console.log('\n📝 Inserindo dados iniciais...');

        // ============================================
        // INSERIR CAMPUS
        // ============================================
        const campusExistente = await db.get('SELECT COUNT(*) as count FROM campi');
        if (campusExistente.count === 0) {
            await db.run(`
                INSERT INTO campi (nome, cidade, estado, uf) VALUES
                ('Campus Centro', 'São Caetano do Sul', 'São Paulo', 'SP'),
                ('Campus Barcelona', 'São Caetano do Sul', 'São Paulo', 'SP'),
                ('Campus Conceição', 'São Caetano do Sul', 'São Paulo', 'SP')
            `);
            console.log('✅ Campus inseridos');
        }

        // ============================================
        // INSERIR CURSOS (Lista completa)
        // ============================================
        const cursosExistentes = await db.get('SELECT COUNT(*) as count FROM cursos');
        if (cursosExistentes.count === 0) {
            const cursos = [
                'Administração', 'Análise e Desenvolvimento de Sistemas', 'Arquitetura e Urbanismo',
                'Banco de Dados', 'Biomedicina', 'Ciências Biológicas', 'Ciência da Computação',
                'Segurança Cibernética', 'Ciências Contábeis', 'Ciências Econômicas',
                'Comércio Exterior', 'Design de Interiores', 'Design Gráfico', 'Direito',
                'Educação Física', 'Enfermagem', 'Engenharia Civil', 'Engenharia da Computação',
                'Engenharia de Controle e Automação', 'Engenharia de Produção', 'Engenharia Elétrica',
                'Engenharia Química', 'Estatística', 'Estética e Cosmética', 'Farmácia',
                'Fisioterapia', 'Fonoaudiologia', 'Inteligência Artificial', 'Gestão Comercial',
                'Gestão da Qualidade', 'Gestão de RH', 'Gestão Financeira', 'Gestão Hospitalar',
                'Gestão de TI', 'Logística', 'Jogos Digitais', 'Jornalismo', 'Marketing',
                'Medicina', 'Medicina Veterinária', 'Nutrição', 'Odontologia', 'Pedagogia',
                'Psicologia', 'Publicidade e Propaganda'
            ];

            for (const curso of cursos) {
                await db.run('INSERT INTO cursos (nome) VALUES (?)', [curso]);
            }
            console.log('✅ Cursos inseridos');
        }

        // ============================================
        // INSERIR TIPOS DE RESÍDUOS
        // ============================================
        const residuosExistentes = await db.get('SELECT COUNT(*) as count FROM tipos_residuos');
        if (residuosExistentes.count === 0) {
            await db.run(`
                INSERT INTO tipos_residuos (nome, descricao, pontos, cor) VALUES
                ('Plástico', 'Garrafas PET, embalagens plásticas, sacolas', 10.0, '#3b82f6'),
                ('Papel', 'Papelão, papel branco, jornal, revista', 5.0, '#10b981'),
                ('Metal', 'Latas de alumínio, ferro, cobre', 15.0, '#f59e0b'),
                ('Vidro', 'Garrafas, potes de vidro', 8.0, '#8b5cf6'),
                ('Orgânico', 'Restos de alimentos, cascas de frutas', 3.0, '#84cc16'),
                ('Eletrônico', 'Pilhas, baterias, eletrônicos pequenos', 20.0, '#ef4444')
            `);
            console.log('✅ Tipos de resíduos inseridos');
        }

        // ============================================
        // INSERIR USUÁRIOS DE TESTE
        // ============================================
        const usuariosExistentes = await db.get('SELECT COUNT(*) as count FROM usuarios');
        if (usuariosExistentes.count === 0) {
            // IMPORTANTE: Em produção, as senhas devem ser hasheadas com bcrypt!
            // Por enquanto, estamos usando senhas simples apenas para teste
            await db.run(`
                INSERT INTO usuarios (nome, email, ra, curso_id, campus_id, tipo_usuario, senha) VALUES
                ('João Silva', 'estudante@test.com', '12345678', 7, 1, 'estudante', '123456'),
                ('Maria Santos', 'maria@test.com', '87654321', 15, 1, 'estudante', '123456'),
                ('Carlos Oliveira', 'voluntario@test.com', NULL, NULL, 1, 'voluntario', '123456'),
                ('Ana Paula', 'admin@test.com', NULL, NULL, NULL, 'admin', '123456')
            `);
            console.log('✅ Usuários de teste inseridos');
            console.log('   📧 estudante@test.com / 123456 (Estudante)');
            console.log('   📧 maria@test.com / 123456 (Estudante)');
            console.log('   📧 voluntario@test.com / 123456 (Voluntário)');
            console.log('   📧 admin@test.com / 123456 (Admin)');
        }

        // ============================================
        // INSERIR RECOMPENSAS
        // ============================================
        const recompensasExistentes = await db.get('SELECT COUNT(*) as count FROM recompensas');
        if (recompensasExistentes.count === 0) {
            await db.run(`
                INSERT INTO recompensas (nome, descricao, pontos_necessarios, tipo) VALUES
                ('Desconto Cantina 10%', '10% de desconto em qualquer produto da cantina', 500, 'desconto'),
                ('Desconto Cantina 20%', '20% de desconto em qualquer produto da cantina', 1000, 'desconto'),
                ('Horas Complementares 5h', '5 horas complementares certificadas', 1000, 'horas'),
                ('Horas Complementares 10h', '10 horas complementares certificadas', 1800, 'horas'),
                ('Camiseta EcoTrack', 'Camiseta sustentável do projeto', 800, 'item'),
                ('Squeeze Reutilizável', 'Garrafa squeeze de 500ml', 600, 'item'),
                ('Kit Canudos Sustentáveis', 'Kit com canudos de inox reutilizáveis', 400, 'item')
            `);
            console.log('✅ Recompensas inseridas');
        }

        // ============================================
        // INSERIR MEDALHAS
        // ============================================
        const medalhasExistentes = await db.get('SELECT COUNT(*) as count FROM medalhas');
        if (medalhasExistentes.count === 0) {
            await db.run(`
                INSERT INTO medalhas (nome, descricao, icone) VALUES
                ('Primeira Entrega', 'Fez sua primeira entrega de resíduos', '🎉'),
                ('10 Entregas', 'Completou 10 entregas', '⭐'),
                ('50 Entregas', 'Completou 50 entregas', '🌟'),
                ('100kg Reciclados', 'Reciclou 100kg de material', '♻️'),
                ('Eco Warrior', 'Reciclou mais de 500kg', '🏆'),
                ('Top 10', 'Entrou no Top 10 do ranking', '🥇'),
                ('Streak 7 dias', 'Fez entregas por 7 dias seguidos', '🔥'),
                ('Diversificado', 'Reciclou todos os tipos de resíduos', '🌈')
            `);
            console.log('✅ Medalhas inseridas');
        }

        console.log('\n✨ Banco de dados inicializado com sucesso!');
        console.log('📍 Localização: backend/db/ecoTrackTeste.db');
        console.log('\n🚀 Agora você pode iniciar o servidor com: npm start');

    } catch (erro) {
        console.error('❌ Erro ao inicializar banco de dados:', erro);
        process.exit(1);
    }
}

// Executa a inicialização
inicializarBancoDeDados();
