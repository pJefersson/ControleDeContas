const inquirer = require('inquirer');
const fs = require('fs'); // Módulo para manipular arquivos

const caminhoArquivoContas = 'contas.json';
const caminhoArquivoBancos = 'bancos.json';
let contas = [];
let bancos = [];
let mensagem = "Bem Vindo ao APP"
const mostrarMensagem = () => {
  console.clear();
  if (mensagem != ""){
    console.log(mensagem)
    console.log("")
    mensagem = "  "
  }
}

// Carrega as contas do arquivo JSON ao iniciar o sistema
function carregarContas() {
  
  if (fs.existsSync(caminhoArquivoContas)) {
    const dadosContas = fs.readFileSync(caminhoArquivoContas, 'utf-8');
    contas = JSON.parse(dadosContas);
  } else {
    contas = [];
  }
}
// Carrega os bancos do arquivo JSON ao iniciar o sistema
function carregarBancos() {
  if (fs.existsSync(caminhoArquivoBancos)) {
    const dadosBancos = fs.readFileSync(caminhoArquivoBancos, 'utf-8');
    bancos = JSON.parse(dadosBancos);
  } else {
    bancos = [];
  }
}

// Salva as contas no arquivo JSON
function salvarContas() {
  fs.writeFileSync(caminhoArquivoContas, JSON.stringify(contas, null, 2));
}
// Salva os bancos no arquivo JSON
function salvarBancos() {
  fs.writeFileSync(caminhoArquivoBancos, JSON.stringify(bancos, null, 2));
}

// Função principal do menu
async function menuPrincipal() {
  mostrarMensagem()
  const resposta = await inquirer.prompt([
    {
      type: 'list',
      name: 'opcao',
      message: 'Selecione uma opção:',
      choices: [
        'Adicionar Conta',
        'Adicionar Banco/Cartão',
        'Listar Contas',
        'Total por cartao',
        'Marcar Conta como Paga',
        'Excluir Conta',
        'Excluir Banco',
        'Sair'
      ],
    },
  ]);

  switch (resposta.opcao) {
    case 'Adicionar Conta':
      await adicionarConta();
      break;
    case 'Adicionar Banco/Cartão':
      await adicionarBanco();
      break;
    case 'Listar Contas':
      await listarContas();
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
    case 'Excluir Banco':
      await excluirBanco();
      break;
    case 'Sair':
      console.log('Saindo do sistema. Até logo!');
      process.exit();
  }

  // Voltar ao menu principal após cada ação
  menuPrincipal();
}

// Função para adicionar um novo banco
async function adicionarBanco() {
  const novoBanco = await inquirer.prompt([
    {name:'nome', message: 'Nome do Banco/Cartão:'}    
  ]);
  if(novoBanco.nome == ""){
    console.log("Formato de banco inválido")
    
  }else{
    bancos.push({nome: novoBanco.nome, total: 0});
    salvarBancos();
    console.log(`Banco: ${novoBanco.nome} adicionado com sucesso!`);
  }  
}
// Função para adicionar uma nova conta
async function adicionarConta() {
  const menuBancos = bancos.map((b) => b = {value: b.nome,})
  const novaConta = await inquirer.prompt([
    { name: 'nome', message: 'Nome da Conta:' },
    { name: 'valor', message: 'Valor da Conta:', validate: validarNumero },
    { name: 'vencimento', message: 'Data de Vencimento (dd/mm/aaaa):' },
    { type:'list', name: 'banco', message: 'Selecione seu banco', choices: [...menuBancos]}
  ]);
  if(novaConta.name == '' || novaConta.valor.length == 0){
    console.log("Formato da conta inválido")
  }else{
    contas.push({ ...novaConta, paga: false });
    salvarContas();
    console.log('Conta adicionada com sucesso!');
  }  
}

// Função para listar todas as contas
async function listarContas() {
  if (contas.length === 0) {
    console.log('Nenhuma conta cadastrada.');
    return;
  }

  console.log('\n=== Listagem de Contas ===');
  let totalPendente = 0;
  let totalPago = 0;

  contas.forEach((conta, index) => {
    const status = conta.paga ? 'Paga' : 'Pendente';
    console.log(
      `${index + 1}. ${conta.nome} - R$${conta.valor} - Vence em: ${conta.vencimento} - [${status}]`
    );

    if (!conta.paga) {
      totalPendente += parseFloat(conta.valor);
    }else{
      totalPago += parseFloat(conta.valor);
    }
  });

  console.log('\n===========================');
  console.log(`Contas em aberto: R$${totalPendente.toFixed(2)}`);
  console.log(`Contas pagas: R$${totalPago.toFixed(2)}`);
  const opcao = [{value: "voltar"}]
  const { voltar } = await inquirer.prompt([{
    name: 'voltar',
    type: 'list',
    message: "",
    choices: [...opcao]

  }])
}
// Função para listar totais por cartão/banco
async function totalPorCartao(){
  
  

  bancos.forEach((banco)=>{
    contas.forEach((conta)=>{
      if(conta.banco == banco.nome){
        banco.total += parseFloat(conta.valor)
      }   
    })
    
    console.log("* " + banco.nome + ": R$" + banco.total.toFixed(2))
  })
  const opcao = [{value: "voltar"}]
  const { voltar } = await inquirer.prompt([{
    name: 'voltar',
    type: 'list',
    message: "",
    choices: [...opcao]

  }])
}

// Função para marcar uma conta como paga
async function marcarContaComoPaga() {
  if (contas.length === 0) {
    console.log('Nenhuma conta para marcar como paga.');
    return;
  }

  const { indice } = await inquirer.prompt([
    {
      type: 'select',
      name: 'indice',
      message: 'Digite o número da conta a ser marcada como paga:',
      choices: []
    },
  ]);
  
  

  contas[indice - 1].paga = true;
  salvarContas();
  console.log('Conta marcada como paga!');
}

// Função para excluir uma conta
async function excluirConta() {
  const menu = contas.map((x) => x = {value: x.nome, paga: " [ " +  x.paga ? 'Paga' : 'Pendente' + "]"})
 

  if (contas.length === 0) {
    console.log('Nenhuma conta para excluir.');
    return;
  }
  
  const { selecao } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selecao',
      message: 'selecione a conta a ser excluída:',
      choices:[...menu]    
    },
  ]);
  
  const salvas = contas.filter((item) => !selecao.includes(item.nome))
  if(selecao.length == 0){
    console.log("Nenhuma conta selecionada")
  }else{
    contas = [...salvas]
    salvarContas();
    console.log('Conta excluída com sucesso!');
  }
  
}

// Função para excluir um banco
async function excluirBanco() {
  const menuBancos = bancos.map((b) => b = {value: b.nome})

  if (contas.length === 0) {
    console.log('Nenhum banco para excluir.');
    return;
  }
  
  const { selecaoBancos } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selecaoBancos',
      message: 'selecione a conta a ser excluída:',
      choices:[...menuBancos],
    },
  ]);
  
  const salvasBancos = bancos.filter((itemB) => !selecaoBancos.includes(itemB.nome))

  if(selecaoBancos.length == 0){
    console.log("Nenhum banco selecionado")
  }else{
    contas.forEach((conta)=>  {
      if(conta.banco == bancos.value){
        
      }else{
        conta.banco = ''
      }
    })
    bancos = [...salvasBancos]
    salvarBancos();
    salvarContas();
    console.log('Banco excluído com sucesso!');
  }  
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
carregarBancos();
menuPrincipal();
