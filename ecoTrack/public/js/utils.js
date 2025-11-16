/**
 * UTILS.JS - Funções Utilitárias
 *
 * Este arquivo contém funções auxiliares que são usadas em várias
 * partes da aplicação. São funções genéricas que ajudam com tarefas
 * comuns como formatação de dados, validações, manipulação de datas, etc.
 */

/**
 * Formata um número para o padrão brasileiro (1.234,56)
 *
 * @param {number} numero - Número a ser formatado
 * @param {number} casasDecimais - Quantidade de casas decimais (padrão: 2)
 * @returns {string} - Número formatado
 */
function formatarNumero(numero, casasDecimais = 2) {
    return Number(numero).toLocaleString('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    });
}

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 *
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} - Data formatada
 */
function formatarData(data) {
    const dataObj = typeof data == 'string' ? new Date(data) : data;

    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data e hora (DD/MM/AAAA HH:MM)
 *
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} - Data e hora formatadas
 */
function formatarDataHora(data) {
    const dataObj = typeof data === 'string' ? new Date(data) : data;

    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/**
 * Valida se um email é válido
 *
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
function validarEmail(email) {
    // Expressão regular (REGEX) para validar o email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida se uma senha é forte
 * Uma senha forte deve ter no mínimo 6 caracteres
 *
 * @param {string} senha - Senha a ser validada
 * @returns {Object} - {valida: boolean, forca: string, mensagem: string}
 */
function validarSenha(senha) {
    if (!senha || senha.length < 6) {
        return {
            valida: false,
            forca: 'fraca',
            mensagem: 'A senha dever ter no mínimo 6 caracteres'
        };
    }

    // Critérios para senha forte
    const temNumero = /\d/.test(senha);
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

    let forca = 'fraca';
    let pontos = 0;

    if (senha.length >= 8) pontos++;
    if (temNumero) pontos++;
    if (temMaiuscula && temMinuscula) pontos++;
    if (temEspecial) pontos++;

    if (pontos >= 3) {
        forca = 'forte';
    } else if (pontos >= 2) {
        forca = 'media';
    }

    return {
        valida: true,
        forca: forca,
        mensagem: forca == 'forte' ? 'Senha forte' :
                  forca == 'media' ? 'Senha média' :
                  'Senha fraca'
    };
}

/**
 * Debounce - Atrasa a execução de uma função até que pare de ser chamada
 * Útil para campos de busca que fazem requisições à API
 *
 * @param {Function} funcao - Função a ser executada
 * @param {number} atraso - Tempo de atraso em milissegundos
 * @returns {Function} - Função com debounce aplicado
 */
function debounce(funcao, atraso = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => funcao.apply(this, args), atraso);
    };
}

/**
 * Sanitiza uma string removendo caracteres HTML perigosos
 * Isso previne ataques XSS (Cross-Site Scripting)
 *
 * @param {string} texto - Texto a ser sanitizado
 * @returns {string} - Texto seguro
 */
function sanitizarTexto(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Cria um elemento HTML com atributos e conteúdo
 *
 * @param {string} tag - Nome da tag HTML
 * @param {Object} atributos - Objeto com atributos do elemento
 * @param {string} conteudo - Conteúdo interno do elemento
 * @returns {HTMLElement} - Elemento criado
 */
function criarElemento(tag, atributos = {}, conteudo = '') {
    const elemento = document.createElement(tag);

    // Adiciona atributos
    Object.keys(atributos).forEach(chave => {
        if (chave === 'className') {
            elemento.className = atributos[chave];
        } else {
            elemento.setAttribute(chave, atributos[chave]);
        }
    });

    // Adiciona conteúdo
    if (conteudo) {
        elemento.innerHTML = conteudo;
    }

    return elemento;
}

/**
 * Mostra um loading/spinner na página
 *
 * @param {boolean} mostrar - true para mostrar, false para esconder
 * @param {string} elementoId - ID do elemento onde mostrar o loading
 */
function toggleLoading(mostrar, elementoId = 'loading') {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    if (mostrar) {
        elemento.classList.remove('hidden');
    } else {
        elemento.classList.add('hidden');
    }
}

/**
 * Copia texto para a área de transferência
 *
 * @param {string} texto - Texto a ser copiado
 * @returns {Promise<boolean>} - true se copiado com sucesso
 */
async function copiarParaAreaTransferencia(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        mostrarSucesso('Copiado para área de transferência!');
        return true;
    } catch (erro) {
        console.error('Erro ao copiar:', erro);
        return false;
    }
}

/**
 * Gera uma cor baseada em uma string (útil para avatares)
 *
 * @param {string} texto - Texto para gerar a cor
 * @returns {string} - Cor em hexadecimal
 */
function gerarCorDaString(texto) {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
        hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }

    const cor = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215);
    return '#' + cor.toString(16).padStart(6, '0');
}

/**
 * Formata bytes para tamanho legível (KB, MB, GB)
 *
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} - Tamanho formatado
 */
function formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + tamanhos[i];
}

/**
 * Calcula diferença entre duas datas em dias
 *
 * @param {Date} data1 - Primeira data
 * @param {Date} data2 - Segunda data
 * @returns {number} - Diferença em dias
 */
function diferencaEmDias(data1, data2) {
    const umDia = 24 * 60 * 60 * 1000;
    const primeiraData = new Date(data1);
    const segundaData = new Date(data2);

    return Math.round(Math.abs((primeiraData - segundaData) / umDia));
}

/**
 * Verifica se uma data é hoje
 *
 * @param {Date|string} data - Data a verificar
 * @returns {boolean} - true se for hoje
 */
function ehHoje(data) {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    const hoje = new Date();

    return dataObj.getDate() === hoje.getDate() &&
           dataObj.getMonth() === hoje.getMonth() &&
           dataObj.getFullYear() === hoje.getFullYear();
}

/**
 * Trunca um texto adicionando reticências
 *
 * @param {string} texto - Texto a truncar
 * @param {number} tamanhoMaximo - Tamanho máximo
 * @returns {string} - Texto truncado
 */
function truncarTexto(texto, tamanhoMaximo = 50) {
    if (texto.length <= tamanhoMaximo) return texto;
    return texto.substring(0, tamanhoMaximo) + '...';
}

/**
 * Capitaliza a primeira letra de cada palavra
 *
 * @param {string} texto - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
function capitalizarPalavras(texto) {
    return texto.replace(/\b\w/g, letra => letra.toUpperCase());
}

/**
 * Remove acentos de uma string
 *
 * @param {string} texto - Texto original
 * @returns {string} - Texto sem acentos
 */
function removerAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera um ID único simples
 *
 * @returns {string} - ID único
 */
function gerarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Ordena um array de objetos por uma propriedade
 *
 * @param {Array} array - Array a ordenar
 * @param {string} propriedade - Nome da propriedade
 * @param {string} ordem - 'asc' ou 'desc'
 * @returns {Array} - Array ordenado
 */
function ordenarPor(array, propriedade, ordem = 'asc') {
    return array.sort((a, b) => {
        if (ordem === 'asc') {
            return a[propriedade] > b[propriedade] ? 1 : -1;
        } else {
            return a[propriedade] < b[propriedade] ? 1 : -1;
        }
    });
}

/**
 * Agrupa um array de objetos por uma propriedade
 *
 * @param {Array} array - Array a agrupar
 * @param {string} propriedade - Nome da propriedade
 * @returns {Object} - Objeto com arrays agrupados
 */
function agruparPor(array, propriedade) {
    return array.reduce((grupos, item) => {
        const chave = item[propriedade];
        if (!grupos[chave]) {
            grupos[chave] = [];
        }
        grupos[chave].push(item);
        return grupos;
    }, {});
}
