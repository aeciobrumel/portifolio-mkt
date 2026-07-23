export interface Servico {
  num: string;
  titulo: string;
  desc: string;
}

export const SERVICOS: Servico[] = [
  { num: '01', titulo: 'Estratégia de Conteúdo', desc: 'Planejamento editorial alinhado aos objetivos da marca.' },
  { num: '02', titulo: 'Gestão de Redes Sociais', desc: 'Rotina de posts, stories e engajamento com a comunidade.' },
  { num: '03', titulo: 'Produção de Vídeo', desc: 'Roteiro, gravação e edição de Reels e TikToks que prendem atenção.' },
  { num: '04', titulo: 'Tráfego & Performance', desc: 'Campanhas pagas com foco em resultado, não em vaidade.' },
];

export interface Projeto {
  titulo: string;
  desc: string;
  embedUrl?: string;
}

export const PROJETOS: Projeto[] = [
  { titulo: 'Lançamento de Produto Digital', desc: 'Estratégia de conteúdo e tráfego para o lançamento de um infoproduto, do teaser ao carrinho aberto.' },
  { titulo: 'Campanha para App de Saúde Mental', desc: 'Planejamento de conteúdo e mídia paga para aquisição de usuários de um app de bem-estar.', embedUrl: 'https://www.youtube.com/embed/iBRxq5Pqt_k' },
  { titulo: 'Gerenciamento de Marketing e Instagram', desc: 'Gestão completa de redes sociais e estratégia de marketing para clientes da Estácio.' },
];

export interface VideoInfo {
  titulo: string;
  tipo: string;
  /** URL do vídeo ou imagem (opcional). Ex: '/videos/lancamento.mp4' ou uma URL externa. */
  src?: string;
  /** 'video' ou 'image'. Só é necessário se `src` apontar para uma imagem. */
  kind?: 'video' | 'image';
}

export const VIDEOS_INFO: VideoInfo[] = [
  { titulo: 'Lançamento de Produto', tipo: 'Reels' },
  { titulo: 'Bastidores da Marca', tipo: 'TikTok' },
  { titulo: 'Sobre a Empresa', tipo: 'Institucional' },
  { titulo: 'Dicas Rápidas', tipo: 'Educativo' },
];

export const TAGS: string[] = ['Instagram', 'Reels & TikTok', 'Copywriting', 'Tráfego Pago', 'Branding'];

export const MARQUEE_WORDS: string[] = ['Marketing Digital', '•', 'Criatividade', '•', 'Estratégia', '•', 'Conteúdo', '•', 'Resultado', '•'];
