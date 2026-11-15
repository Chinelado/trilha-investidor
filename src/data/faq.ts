export const FAQ: { tema: string; itens: { p: string; r: string }[] }[] = [
  {
    tema: 'Começando',
    itens: [
      { p: 'Com quanto dinheiro dá para começar?', r: 'Com cerca de R$ 30 já se compra uma fração de título no Tesouro Direto, e muitos CDBs aceitam a partir de R$ 1. O valor inicial importa menos do que criar o hábito do aporte mensal.' },
      { p: 'Tenho dívidas. Invisto ou quito?', r: 'Dívidas caras, como cartão, cheque especial e crédito pessoal, vêm primeiro: os juros delas superam qualquer investimento seguro. Dívidas baratas, como financiamento imobiliário, podem conviver com os aportes.' },
      { p: 'Preciso de uma corretora ou o banco basta?', r: 'Os dois funcionam. Compare se há taxa de custódia ou corretagem e a variedade de produtos. Verifique sempre se a instituição é autorizada pelo Banco Central e pela CVM.' },
      { p: 'A poupança ainda vale a pena?', r: 'Ela é segura e isenta, mas rende menos do que Tesouro Selic ou um CDB de 100% do CDI com liquidez diária, que têm segurança equivalente. Para a reserva de emergência, essas opções são melhores.' },
      { p: 'Qual é a ordem certa para investir?', r: '1) Organizar o orçamento. 2) Quitar dívidas caras. 3) Montar a reserva de emergência. 4) Renda fixa para objetivos de médio prazo. 5) Renda variável e exterior para o longo prazo, conforme o seu perfil.' },
    ],
  },
  {
    tema: 'Segurança',
    itens: [
      { p: 'O que acontece se a corretora quebrar?', r: 'Ações, FIIs, ETFs e títulos do Tesouro ficam registrados no seu CPF na B3, separados do patrimônio da corretora. Você transfere a custódia para outra instituição. Já o saldo parado em conta na corretora não tem essa proteção ampla, então evite deixar dinheiro parado.' },
      { p: 'O que acontece se o banco quebrar?', r: 'CDB, LCI, LCA, poupança e conta têm cobertura do FGC até R$ 250 mil por CPF e por instituição, com teto de R$ 1 milhão a cada 4 anos. O pagamento pode levar semanas, e o dinheiro não rende nesse intervalo.' },
      { p: 'O Tesouro Direto pode dar calote?', r: 'É o menor risco de crédito do país, pois o governo emite a própria moeda. O risco relevante é o de preço: prefixados e IPCA+ oscilam se vendidos antes do vencimento.' },
      { p: 'Como saber se uma oferta é golpe?', r: 'Desconfie de retorno garantido e alto, urgência, ganho por indicar pessoas e depósito em conta de pessoa física. Consulte o registro da empresa na CVM e no Banco Central antes de transferir qualquer valor.' },
      { p: 'Meus dados neste site estão seguros?', r: 'Tudo o que você registra aqui é cifrado com a sua senha (AES-256) e guardado só neste dispositivo. Nada é enviado a servidores. A única conexão externa opcional é a consulta a indicadores públicos do Banco Central, que não leva nenhum dado seu. Sem a senha, nem você nem ninguém consegue ler os dados, por isso guarde-a em um gerenciador de senhas e faça backups.' },
    ],
  },
  {
    tema: 'Renda fixa',
    itens: [
      { p: 'O que é melhor: prefixado, pós-fixado ou IPCA+?', r: 'Depende do objetivo. Pós-fixado para reserva e curto prazo. Prefixado quando você quer saber exatamente quanto terá em uma data. IPCA+ para preservar poder de compra em prazos longos. Ter os três diversifica.' },
      { p: 'Posso perder dinheiro em renda fixa?', r: 'Sim, em três situações: vender prefixado ou IPCA+ antes do vencimento com juros mais altos, calote de emissor privado sem FGC, ou render abaixo da inflação.' },
      { p: 'CDB de 120% do CDI é sempre melhor que um de 100%?', r: 'Não necessariamente. Veja o emissor (taxa alta indica risco maior), o prazo, se há liquidez e se o valor cabe no limite do FGC.' },
      { p: 'Como comparar LCI com CDB?', r: 'Divida a taxa da LCI por (1 − alíquota de IR do prazo). O resultado é a taxa de CDB equivalente. A calculadora da página Ferramentas faz a conta.' },
    ],
  },
  {
    tema: 'Renda variável',
    itens: [
      { p: 'Quando posso começar a investir em ações?', r: 'Quando tiver reserva de emergência completa, dinheiro que não será usado por pelo menos 5 anos e clareza de que quedas de 30% ou mais fazem parte.' },
      { p: 'É melhor escolher ações ou comprar ETFs?', r: 'Para a maioria das pessoas, ETFs amplos entregam diversificação e custo baixo com pouco trabalho. Escolher ações exige estudo contínuo e a maior parte dos profissionais não supera o índice.' },
      { p: 'FIIs são renda fixa?', r: 'Não. Pagam rendimentos mensais, mas o valor da cota oscila na bolsa e o rendimento pode cair.' },
      { p: 'Vale a pena fazer day trade?', r: 'As pesquisas com dados da CVM mostram que mais de 90% das pessoas físicas perdem dinheiro. Para construir patrimônio, não é necessário nem recomendável.' },
      { p: 'A bolsa caiu muito. Devo vender?', r: 'Se o dinheiro é de longo prazo e a alocação está de acordo com seu perfil, quedas são momento de manter os aportes e rebalancear. Vender na queda transforma oscilação em perda definitiva.' },
    ],
  },
  {
    tema: 'Impostos',
    itens: [
      { p: 'Preciso declarar investimentos no imposto de renda?', r: 'Quem é obrigado a declarar informa todos os investimentos, inclusive os isentos. Operações em bolsa acima de certos limites também obrigam à declaração. Use os informes de rendimento das instituições.' },
      { p: 'Quais investimentos são isentos de IR?', r: 'Para pessoa física: poupança, LCI, LCA, CRI, CRA, debêntures incentivadas, rendimentos mensais de FIIs, dividendos até R$ 50 mil por mês por empresa e vendas de ações até R$ 20 mil no mês.' },
      { p: 'O que mudou nos dividendos em 2026?', r: 'A Lei 15.270/2025 criou retenção de 10% sobre dividendos que superem R$ 50 mil por mês pagos por uma mesma empresa a uma pessoa física. Abaixo disso, seguem isentos.' },
      { p: 'LCI e LCA passaram a pagar imposto?', r: 'Não. A medida provisória de 2025 que previa 5% perdeu a validade sem ser aprovada. Como o tema volta ao debate, confira a página Mercado.' },
    ],
  },
  {
    tema: 'Uso do sistema',
    itens: [
      { p: 'Como levo meus dados do laptop para o celular?', r: 'Em Ajustes, toque em "Exportar backup". O arquivo sai cifrado. Envie-o para o celular (cabo, e-mail para você mesmo, nuvem pessoal), abra o site lá e use "Restaurar backup" com a mesma senha.' },
      { p: 'Esqueci a senha. E agora?', r: 'Não há recuperação, pois a senha não é guardada em lugar nenhum. Você pode restaurar um backup cuja senha lembre ou apagar os dados e recomeçar.' },
      { p: 'Por que a próxima lição está bloqueada?', r: 'As lições são liberadas uma por semana, para dar tempo de praticar. Se preferir avançar no seu ritmo, ative "Ritmo livre" em Ajustes.' },
      { p: 'Os números de mercado estão atualizados?', r: 'O conteúdo traz a data da última validação. Na página Mercado, o botão "Atualizar pelo Banco Central" busca Selic, CDI, IPCA e dólar do dia, e os gráficos passam a usar esses valores.' },
      { p: 'Como funciona a análise da página Carteira?', r: 'Você cadastra cada investimento com tipo e valor. O sistema separa a reserva de emergência (meses de despesas que você escolher), compara o restante com a sua alocação-alvo e mostra quanto aumentar ou reduzir em cada tipo e em cada investimento. Também aponta reserva incompleta, valor acima do limite do FGC, concentração em um único ativo e excesso de alto risco. São cálculos sobre o alvo que você define, não uma recomendação individual.' },
      { p: 'Isto é recomendação de investimento?', r: 'Não. O conteúdo é educacional e geral. Decisões sobre o seu dinheiro dependem da sua situação; para orientação individual, procure um profissional certificado (planejador CFP, consultor ou analista credenciado na CVM).' },
    ],
  },
];
