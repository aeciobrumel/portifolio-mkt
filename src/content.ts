import video1 from './img/VIDEO1.mp4';
import video2 from './img/VIDEO2.mp4';
import video3 from './img/VIDEO3.mp4';
import video4 from './img/VIDEO4.mp4';
import produto1 from './img/PRODUTO1.webp';
import produto2 from './img/PRODUTO2.webp';
import produto3 from './img/PRODUTO3.webp';
import produto4 from './img/PRODUTO4.webp';
import produto5 from './img/PRODUTO5.webp';
import produto6 from './img/PRODUTO6.webp';
import produto7 from './img/PRODUTO7.webp';
import designGrafico1 from './img/2PRODUTO1.webp';
import designGrafico2 from './img/2PRODUTO2.webp';
import designGrafico3 from './img/2PRODUTO3.webp';
import designGrafico4 from './img/2PRODUTO4.webp';
import designGrafico5 from './img/2PRODUTO5.webp';
import designGrafico6 from './img/2PRODUTO6.webp';
import panfleto1 from './img/3PRODUTO1.webp';
import panfleto2 from './img/3PRODUTO2.webp';
import perfil from './img/perfil.webp';

export const PERFIL_IMG = perfil;

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
  /** Imagens do carrossel estilo Instagram (multi-post). */
  imagens: string[];
}

export const PROJETOS: Projeto[] = [
  {
    titulo: 'Lançamento de Produto Digital',
    desc: 'Estratégia de conteúdo e tráfego para o lançamento de um infoproduto, do teaser ao carrinho aberto.',
    imagens: [produto1, produto2, produto3, produto4, produto5, produto6, produto7],
  },
  {
    titulo: 'Design Gráfico',
    desc: 'Criação de peças para redes sociais.',
    imagens: [designGrafico1, designGrafico2, designGrafico3, designGrafico4, designGrafico5, designGrafico6],
  },
  {
    titulo: 'Design Panfletos de Divulgação',
    desc: 'Materiais desenvolvidos para 5 polos institucionais.',
    imagens: [panfleto1, panfleto2],
  },
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
  { titulo: 'Bastidores Inauguração Programa de TV', tipo: 'Shirlei Coden', src: video1 },
  { titulo: 'Apresentação de Serviço', tipo: 'Terapeuta Integrativa', src: video2 },
  { titulo: 'Apresentação de Produto Digital', tipo: 'Aplicativo', src: video3 },
  { titulo: 'Formação Acadêmica', tipo: 'Institucional', src: video4 },
];

export const TAGS: string[] = ['Instagram', 'Reels & TikTok', 'Copywriting', 'Tráfego Pago', 'Branding'];

export const MARQUEE_WORDS: string[] = ['Marketing Digital', '•', 'Criatividade', '•', 'Estratégia', '•', 'Conteúdo', '•', 'Resultado', '•'];
