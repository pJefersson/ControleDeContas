const inquirer = require('inquirer');
const fs = require('fs'); // Módulo para manipular arquivos

const caminhoArquivo = 'contas.json';
let contas = [];

// Carrega as contas do arquivo JSON ao iniciar o sistema
function carregarContas() {
  if (fs.existsSync(caminhoArquivo)) {
    const dados = fs.readFileSync(caminhoArquivo, 'utf-8');
    contas = JSON.parse(dados);
  } else {
    contas = [];
  }
}

// Salva as contas no arquivo JSON
function salvarContas() {
  fs.writeFileSync(caminhoArquivo, JSON.stringify(contas, null, 2));
}

// Função principal do menu
async function menuPrincipal() {
  const resposta = await inquirer.prompt([
    {
      type: 'list',
      name: 'opcao',
      message: 'Selecione uma opção:',
      choices: [
        'Adicionar Conta',
        'Listar Contas',
        'Total por cartao',
        'Marcar Conta como Paga',
        'Excluir Conta',
        'Sair'
      ],
    },
  ]);

  switch (resposta.opcao) {
    case 'Adicionar Conta':
      await adicionarConta();
      break;
    case 'Listar Contas':
      listarContas();
      break;
    case 'Total por cartao':
      await totalPorCartao();
      break;
    case 'Marcar Conta como Paga':
      await marcarContaComoPaga();
      break;
    case 'Excluir Conta':
      await excluirConta();
      break;
    case 'Sair':
      console.log('Saindo do sistema. Até logo!');
      process.exit();
  }

  // Voltar ao menu principal após cada ação
  menuPrincipal();
}

// Função para adicionar uma nova conta
async function adicionarConta() {
  const novaConta = await inquirer.prompt([
    { name: 'nome', message: 'Nome da Conta:' },
    { name: 'valor', message: 'Valor da Conta:', validate: validarNumero },
    { name: 'vencimento', message: 'Data de Vencimento (dd/mm/aaaa):' },
    { name: "banco", message: "Digite o banco/cartão"}
  ]);

  contas.push({ ...novaConta, paga: false });
  salvarContas();
  console.log('Conta adicionada com sucesso!');
}

// Função para listar todas as contas
function listarContas() {
  if (contas.length === 0) {
    console.log('Nenhuma conta cadastrada.');
    return;
  }

  console.log('\n=== Listagem de Contas ===');
  let totalPendente = 0;

  contas.forEach((conta, index) => {
    const status = conta.paga ? 'Paga' : 'Pendente';
    console.log(
      `${index + 1}. ${conta.nome} - R$${conta.valor} - Vence em: ${conta.vencimento} - [${status}]`
    );

    if (!conta.paga) {
      totalPendente += parseFloat(conta.valor);
    }
  });

  console.log('\n===========================');
  console.log(`Total de contas em aberto: R$${totalPendente.toFixed(2)}`);
}

function totalPorCartao(){
  let nubank = 0;
  let will = 0;
  let picpay = 0;
  contas.forEach((conta)=>{
    if (conta.banco == "nubank") {
      nubank += parseFloat(conta.valor);
    }else if(conta.banco == "will"){
      will += parseFloat(conta.valor);
    }else if(conta.banco == "picpay"){
      picpay += parseFloat(conta.valor);
    }
  })
  console.log('\n===========================');
  console.log(`Total de contas em Nubank: R$${nubank.toFixed(2)}`);
  console.log(`Total de contas em Will: R$${will.toFixed(2)}`);
  console.log(`Total de contas em PicPay: R$${picpay.toFixed(2)}`);
}


// Função para marcar uma conta como paga
async function marcarContaComoPaga() {
  if (contas.length === 0) {
    console.log('Nenhuma conta para marcar como paga.');
    return;
  }

  const { indice } = await inquirer.prompt([
    {
      type: 'input',
      name: 'indice',
      message: 'Digite o número da conta a ser marcada como paga:',
      validate: validarIndice,
    },
  ]);

  contas[indice - 1].paga = true;
  salvarContas();
  console.log('Conta marcada como paga!');
}

// Função para excluir uma conta
async function excluirConta() {
  if (contas.length === 0) {
    console.log('Nenhuma conta para excluir.');
    return;
  }

  const { indice } = await inquirer.prompt([
    {
      type: 'input',
      name: 'indice',
      message: 'Digite o número da conta a ser excluída:',
      validate: validarIndice,
    },
  ]);

  contas.splice(indice - 1, 1);
  salvarContas();
  console.log('Conta excluída com sucesso!');
}

// Validação para números inteiros válidos
function validarIndice(valor) {
  const numero = parseInt(valor);
  if (isNaN(numero) || numero < 1 || numero > contas.length) {
    return 'Digite um número válido.';
  }
  return true;
}

// Validação para valores numéricos
function validarNumero(valor) {
  return !isNaN(valor) || 'Digite um valor numérico válido.';
}

// Iniciar o sistema
carregarContas();
menuPrincipal();
