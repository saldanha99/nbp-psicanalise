export interface Artigo {
  slug: string;
  titulo: string;
  subtitulo?: string;
  imagemCapa: string;
  autorNome: string;
  autorFoto: string;
  dataPublicacao: string;
  resumo: string;
  conteudoCompleto: string;
}

export const artigos: Artigo[] = [
  {
    slug: 'sobre-a-formacao-de-um-a-psicanalista',
    titulo: 'SOBRE A FORMAÇÃO DE UM(A) PSICANALISTA',
    subtitulo: 'A Psicanálise no Brasil é uma profissão livre e autorregulada',
    imagemCapa: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/sobre-formacao-psicanalista.jpeg',
    autorNome: 'Aurélio Gonzales',
    autorFoto: 'https://nbpsicanalise.com.br/wp-content/uploads/2021/04/docente-aurelio.jpeg',
    dataPublicacao: '19 Mai 2023',
    resumo: 'A Psicanálise no Brasil é uma profissão livre, de acordo com a CBO (Classificação Brasileira de Ocupações) do Ministério do Trabalho e Emprego – Portaria MTE nº 397/02 MTE. A...',
    conteudoCompleto: `
      <p>A Psicanálise no Brasil é uma profissão livre, de acordo com a CBO (Classificação Brasileira de Ocupações) do Ministério do Trabalho e Emprego – Portaria MTE nº 397/02 MTE. Isso significa que ela não é regulamentada por uma lei federal ou conselho federal específico (como a Medicina ou Psicologia), mas sim autorregulada por instituições formadoras.</p>
      
      <p>Portanto, qualquer pessoa com curso superior em qualquer área do conhecimento humano pode realizar a formação acadêmica em psicanálise. A formação fornecida pelo NBP se baseia estritamente no tripé clássico estabelecido por Sigmund Freud:</p>
      
      <h3>O Tripé Psicanalítico</h3>
      <ul>
        <li><strong>Estudo Teórico:</strong> Compreensão profunda da literatura psicanalítica, abrangendo desde Freud até os teóricos contemporâneos como Jacques Lacan, Donald Winnicott e Melanie Klein.</li>
        <li><strong>Análise Pessoal:</strong> O futuro analista deve submeter-se à própria análise clínica para compreender seus próprios processos inconscientes.</li>
        <li><strong>Supervisão Clínica:</strong> A condução dos primeiros atendimentos supervisionada de perto por analistas experientes (didatas).</li>
      </ul>

      <p>O Núcleo Brasileiro de Psicanálise (NBP) oferece esse ecossistema completo para garantir que você saia devidamente preparado para a prática profissional ética, com amparo legal e certificação de excelência.</p>
    `
  },
  {
    slug: 'aos-psicanalistas',
    titulo: 'AOS PSICANALISTAS',
    subtitulo: 'A importância da autoanálise constante na prática clínica',
    imagemCapa: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/post-aos-psicanalistas.jpeg',
    autorNome: 'Sigmund Freud',
    autorFoto: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Sigmund_Freud_LIFE.jpg',
    dataPublicacao: '19 Mai 2022',
    resumo: 'Última entrevista dada por Sigmund Freud a George Sylvester Viereck. A entrevista ocorreu em sua casa de veraneio em Semmering, nos Alpes austríacos. Segue de George: Freud: O fato de parecer tão...',
    conteudoCompleto: `
      <p>Última entrevista dada por Sigmund Freud a George Sylvester Viereck. A entrevista ocorreu em sua residência de verão em Semmering, nos Alpes austríacos. Segundo George, Freud tinha a face contraída, como se estivesse sofrendo, após uma intervenção cirúrgica devido ao câncer na mandíbula. Ainda assim, continuava cortês e atento.</p>
      
      <blockquote>
        <p>"Setenta anos me ensinaram a aceitar a vida com serena humildade."</p>
        <cite>— Sigmund Freud</cite>
      </blockquote>

      <p>Durante o diálogo, surge uma das maiores reflexões sobre o trabalho e a preparação do analista:</p>

      <p><strong>George Sylvester Viereck:</strong> O senhor já se analisou?</p>
      <p><strong>Sigmund Freud:</strong> Obviamente. O psicanalista deve analisar-se constantemente. Aumenta nossa capacidade de analisar os outros. O psicanalista é como o bode expiatório dos hebreus. Os demais depositam nele os seus pecados.</p>

      <p>Esse trecho reforça que a análise do próprio terapeuta nunca se encerra de fato. A escuta analítica pura e sem julgamentos só é viável quando o analista mantém seus próprios conflitos sob constante observação e tratamento.</p>
    `
  },
  {
    slug: 'somos-adultos-criancas',
    titulo: 'SOMOS ADULTOS CRIANÇAS!',
    subtitulo: 'Como a imaturidade emocional e a impulsividade afetam nossa comunicação',
    imagemCapa: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/post-adultos-criancas.jpeg',
    autorNome: 'Aurélio Gonzales',
    autorFoto: 'https://nbpsicanalise.com.br/wp-content/uploads/2021/04/docente-aurelio.jpeg',
    dataPublicacao: '11 Abr 2021',
    resumo: 'A criança é sempre atrativa aos olhos por todos, pois sempre fala sem papas na língua, diz tudo que pensa, que sente, expressa de forma natural o...',
    conteudoCompleto: `
      <p>A criança é sempre vista com bons olhos por todos, por sempre falarem o que pensam, sem filtros ou as convenções sociais da vida adulta. Entretanto, dizer tudo o que se acha, o que se pensa e até mesmo tudo o que se sente nem sempre é saudável na vida adulta.</p>
      
      <p>É exatamente aí que reside a diferença entre ser criança e ser adulto na comunicação: a capacidade consciente de discernir o que falar, o que não falar, como falar e para quem falar.</p>
      
      <p>A imaturidade se manifesta quando expressamos pensamentos e emoções de forma puramente narcísica e impulsiva, sem medir o impacto das nossas palavras. Na psicanálise, o processo terapêutico atua como um caminho para a estruturação do Ego, fornecendo ao sujeito a maturidade necessária para organizar suas demandas e desejos de forma saudável e adaptada.</p>
      
      <p>Reconhecer a "criança interior" não significa dar vazão a birras e desabafos sem filtros, mas acolher essa dimensão e posicionar o Ego maduro no controle da tomada de decisão e da fala.</p>
    `
  }
];
