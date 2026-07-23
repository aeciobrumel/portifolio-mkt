import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SERVICOS, PROJETOS, VIDEOS_INFO, TAGS, MARQUEE_WORDS } from './content';

function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  }, []);
  return isTouch;
}

function useMagnetic(ref: React.RefObject<HTMLElement>, strength: number) {
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width / 2;
    const relY = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
  }, [ref, strength]);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  }, [ref]);
  return { onMove, onLeave };
}

function useTilt(ref: React.RefObject<HTMLElement>, strength: number) {
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${py * -strength}deg) rotateY(${px * strength}deg) scale3d(1.03,1.03,1.03)`;
  }, [ref, strength]);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  }, [ref]);
  return { onMove, onLeave };
}

interface RevealProps {
  id: string;
  delay?: number;
  className?: string;
  children: React.ReactNode;
  onRegister: (id: string, el: HTMLElement, setVisible: (v: boolean) => void) => void;
}

function Reveal({ id, delay = 0, className = '', children, onRegister }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (ref.current) onRegister(id, ref.current, setVisible); }, [id, onRegister]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.9s cubic-bezier(.16,.1,.3,1) ${delay}s, transform 0.9s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

type MediaKind = 'video' | 'image';

interface SectionEntry {
  el: HTMLElement;
  setVisible: (v: boolean) => void;
  done: boolean;
}

export default function Portfolio() {
  const isTouch = useIsTouch();
  const [heroIn, setHeroIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [preloaderRemoved, setPreloaderRemoved] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const videoSrcs: Record<number, string> = {};
  const mediaKinds: Record<number, MediaKind> = {};
  VIDEOS_INFO.forEach((v, i) => {
    if (v.src) { videoSrcs[i] = v.src; mediaKinds[i] = v.kind ?? 'video'; }
  });

  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const cursorLabel = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const backToTop = useRef<HTMLDivElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const navCta = useRef<HTMLAnchorElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const services = useRef<HTMLDivElement>(null);
  const arrowLeft = useRef<HTMLDivElement>(null);
  const arrowRight = useRef<HTMLDivElement>(null);
  const email = useRef<HTMLAnchorElement>(null);
  const whats = useRef<HTMLAnchorElement>(null);
  const insta = useRef<HTMLAnchorElement>(null);
  const sectionRefs = useRef<Record<string, SectionEntry>>({});

  const registerSection = useCallback((key: string, el: HTMLElement, setVisible: (v: boolean) => void) => {
    sectionRefs.current[key] = { el, setVisible, done: false };
  }, []);

  // preloader
  useEffect(() => {
    const steps = [14, 33, 57, 78, 100];
    const timers = steps.map((pct, i) => setTimeout(() => {
      setLoadPct(pct);
      if (pct === 100) {
        setTimeout(() => {
          setLoaded(true);
          setHeroIn(true);
          setTimeout(() => setPreloaderRemoved(true), 900);
        }, 300);
      }
    }, i * 220));
    return () => timers.forEach(clearTimeout);
  }, []);

  const checkReveals = useCallback(() => {
    const vh = window.innerHeight;
    Object.values(sectionRefs.current).forEach((entry) => {
      if (!entry || entry.done) return;
      const r = entry.el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        entry.done = true;
        entry.setVisible(true);
      }
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progressBar.current) progressBar.current.style.width = pct + '%';
      if (backToTop.current) {
        const show = window.scrollY > 700;
        backToTop.current.style.opacity = show ? '1' : '0';
        backToTop.current.style.pointerEvents = show ? 'auto' : 'none';
      }
      checkReveals();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkReveals, { passive: true });
    checkReveals();
    const t = setTimeout(checkReveals, 400);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', checkReveals); clearTimeout(t); };
  }, [checkReveals]);

  // custom cursor
  useEffect(() => {
    if (isTouch) return;
    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf: number;
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (cursorDot.current) cursorDot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };
    const loop = () => {
      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;
      if (cursorRing.current) cursorRing.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      if (cursorLabel.current) cursorLabel.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove);
    loop();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [isTouch]);

  const cursorEnter = () => {
    const el = cursorRing.current;
    if (!el) return;
    el.style.width = '56px'; el.style.height = '56px'; el.style.margin = '-28px 0 0 -28px';
    el.style.background = 'oklch(0.52 0.24 292 / 0.15)';
  };
  const cursorLeave = () => {
    const el = cursorRing.current;
    if (!el) return;
    el.style.width = '14px'; el.style.height = '14px'; el.style.margin = '-7px 0 0 -7px';
    el.style.background = 'transparent';
  };
  const cursorEnterLabel = (label: string) => () => {
    cursorEnter();
    if (cursorRing.current) cursorRing.current.style.background = 'oklch(0.52 0.24 292)';
    if (cursorLabel.current) { cursorLabel.current.textContent = label; cursorLabel.current.style.opacity = '1'; }
  };
  const cursorLeaveLabel = () => { cursorLeave(); if (cursorLabel.current) cursorLabel.current.style.opacity = '0'; };

  const photoTilt = useTilt(photo, 6);
  const navMag = useMagnetic(navCta, 0.3);
  const arrowLeftMag = useMagnetic(arrowLeft, 0.4);
  const arrowRightMag = useMagnetic(arrowRight, 0.4);
  const emailMag = useMagnetic(email, 0.3);
  const whatsMag = useMagnetic(whats, 0.3);
  const instaMag = useMagnetic(insta, 0.3);

  const scrollCarousel = (dir: number) => {
    const el = carousel.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const onServicesMove = (e: React.MouseEvent) => {
    const el = services.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sx', e.clientX - r.left + 'px');
    el.style.setProperty('--sy', e.clientY - r.top + 'px');
  };

  const heroIntro = (delay: number) => ({
    opacity: heroIn ? 1 : 0,
    transform: heroIn ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
  });

  return (
    <div className="w-full overflow-x-hidden text-[oklch(0.16_0_0)]" style={{ cursor: isTouch ? 'auto' : 'none' }}>
      {!isTouch && (
        <>
          <div ref={cursorDot} className="fixed top-0 left-0 w-2 h-2 -mt-1 -ml-1 rounded-full bg-[oklch(0.16_0_0)] pointer-events-none z-[9999] will-change-transform" />
          <div ref={cursorRing} className="fixed top-0 left-0 w-3.5 h-3.5 -mt-[7px] -ml-[7px] rounded-full border border-[1.5px] border-[oklch(0.52_0.24_292)] pointer-events-none z-[9998] mix-blend-difference transition-[width,height,margin,background] duration-200 will-change-transform" />
          <div ref={cursorLabel} className="fixed top-0 left-0 -mt-[30px] -ml-[30px] w-[60px] h-[60px] flex items-center justify-center text-white text-[11px] font-extrabold tracking-wide pointer-events-none z-[10000] opacity-0 transition-opacity duration-200 will-change-transform" />
        </>
      )}

      <div className="fixed top-0 left-0 w-full h-[3px] z-[9997]">
        <div ref={progressBar} className="h-full w-0 bg-[oklch(0.52_0.24_292)]" />
      </div>

      {!preloaderRemoved && (
        <div
          className="fixed inset-0 z-[10001] bg-[oklch(0.16_0_0)] flex flex-col items-center justify-center"
          style={{ opacity: loaded ? 0 : 1, transform: `translateY(${loaded ? '-100%' : '0'})`, transition: 'opacity .5s ease .3s, transform .8s cubic-bezier(.76,0,.24,1) .1s' }}
        >
          <div className="absolute top-8 left-10 font-[Anton] text-white text-lg">MARIA<span className="text-[oklch(0.52_0.24_292)]">.</span></div>
          <div className="font-[Anton] text-white leading-none" style={{ fontSize: 'min(20vw,160px)' }}>{loadPct}<span className="text-[oklch(0.52_0.24_292)]">%</span></div>
          <div className="w-[220px] h-0.5 bg-white/15 mt-6 overflow-hidden">
            <div className="h-full bg-[oklch(0.52_0.24_292)] transition-[width] duration-200" style={{ width: loadPct + '%' }} />
          </div>
        </div>
      )}

      <div
        ref={backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMouseEnter={cursorEnter}
        onMouseLeave={cursorLeave}
        className="fixed bottom-4 right-4 md:bottom-7 md:right-7 w-12 h-12 rounded-full bg-[oklch(0.16_0_0)] text-white flex items-center justify-center text-lg cursor-pointer z-[9995] opacity-0 pointer-events-none transition-[opacity,transform] duration-300"
      >↑</div>

      {/* NAV */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 px-4 md:px-12 py-5 bg-[oklch(0.97_0.008_90/0.85)] backdrop-blur-sm border-b border-[oklch(0.16_0_0/0.08)]">
        <div className="font-[Anton] text-[22px] tracking-wide">MARIA<span className="text-[oklch(0.52_0.24_292)]">.</span></div>
        <div className="flex flex-wrap gap-3 md:gap-8 items-center text-sm font-semibold">
          <a href="#sobre" onMouseEnter={cursorEnter} onMouseLeave={cursorLeave} className="text-[oklch(0.16_0_0)] hover:text-[oklch(0.52_0.24_292)]">Sobre</a>
          <a href="#videos" onMouseEnter={cursorEnter} onMouseLeave={cursorLeave} className="text-[oklch(0.16_0_0)] hover:text-[oklch(0.52_0.24_292)]">Conteúdos</a>
          <a href="#projetos" onMouseEnter={cursorEnter} onMouseLeave={cursorLeave} className="text-[oklch(0.16_0_0)] hover:text-[oklch(0.52_0.24_292)]">Projetos</a>
          <a
            ref={navCta} href="#contato" onMouseMove={navMag.onMove} onMouseLeave={navMag.onLeave}
            className="bg-[oklch(0.16_0_0)] text-white px-5 py-3 min-h-11 box-border inline-flex items-center rounded-full font-bold whitespace-nowrap transition-transform duration-200 active:scale-95 active:bg-[oklch(0.52_0.24_292)]"
          >Fale comigo</a>
        </div>
      </div>

      {/* HERO */}
      <div
        className="flex flex-col items-center justify-center text-center px-5 relative"
        style={{ padding: 'clamp(60px,15vw,100px) 20px clamp(40px,10vw,70px)', backgroundImage: 'radial-gradient(closest-side, oklch(0.52 0.24 292 / 0.14), transparent 70%)', backgroundPosition: 'center 42%', backgroundRepeat: 'no-repeat', backgroundSize: '130% 130%' }}
      >
        <div
          className="font-bold uppercase text-[oklch(0.45_0_0)] whitespace-nowrap"
          style={{ fontSize: 'clamp(11px,3vw,13px)', letterSpacing: 'clamp(1.5px,0.8vw,3px)', marginBottom: 'clamp(32px,8vw,52px)', ...heroIntro(0.05) }}
        >Sejam bem-vindos</div>
        <div className="relative leading-[0.82]">
          <div className="font-[Anton]" style={{ fontSize: 'clamp(40px,15vw,190px)', letterSpacing: '-0.03em' }}>
            {'PORTFOLIO'.split('').map((ch, i) => (
              <span key={i} className="inline-block" style={{
                opacity: heroIn ? 1 : 0,
                transform: heroIn ? 'translateY(0)' : 'translateY(70px)',
                transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.045}s, transform .7s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.045}s`,
              }}>{ch}</span>
            ))}
          </div>
          <div
            className="absolute top-1/2 left-1/2 whitespace-nowrap [font-family:'Miss_Fajardose']"
            style={{
              transform: 'translate(-50%,-50%) rotate(-7deg)', fontSize: 'clamp(60px,20vw,240px)', letterSpacing: '0.02em',
              color: 'oklch(0.52 0.24 292)', WebkitTextStroke: '8px oklch(0.97 0.008 90)', paintOrder: 'stroke fill',
              opacity: heroIn ? 1 : 0, transition: 'opacity .9s cubic-bezier(.16,1,.3,1) 0.6s',
            }}
          >Maria</div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 mt-8" style={heroIntro(1.05)}>
          <div className="flex-1 max-w-16 min-w-4 h-px bg-[oklch(0.16_0_0/0.3)]" />
          <div className="font-bold tracking-wide whitespace-nowrap" style={{ fontSize: 'clamp(11px,3vw,14px)' }}>Marketing Digital</div>
          <div className="flex-1 max-w-16 min-w-4 h-px bg-[oklch(0.16_0_0/0.3)]" />
        </div>
        <div className="font-semibold text-[oklch(0.45_0_0)] tracking-wide" style={{ marginTop: 'clamp(40px,8vw,70px)', fontSize: 'clamp(11px,3vw,13px)', ...heroIntro(1.2) }}>role para conhecer meu trabalho ↓</div>
      </div>

      {/* MARQUEE */}
      <div className="overflow-hidden bg-[oklch(0.16_0_0)] py-4 -my-1.5 mb-9" style={{ transform: 'rotate(-1.1deg)' }}>
        <div className="flex w-max whitespace-nowrap" style={{ animation: 'marqueeScroll 26s linear infinite' }}>
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((m, i) => (
            <div key={i} className="font-[Anton] text-2xl text-white tracking-wide px-[22px]">{m}</div>
          ))}
        </div>
      </div>

      {/* SOBRE */}
      <div id="sobre" className="max-w-6xl mx-auto flex flex-wrap gap-12 items-center" style={{ padding: '44px clamp(20px,5vw,48px) 100px' }}>
        <Reveal id="sobre-text" onRegister={registerSection} className="flex-1 min-w-[320px]">
          <div className="font-[Anton] leading-none" style={{ fontSize: 'clamp(32px,8vw,48px)' }}>OLÁ, EU SOU</div>
          <div className="[font-family:'Miss_Fajardose'] mt-1.5" style={{ fontSize: 'clamp(40px,10vw,60px)', color: 'oklch(0.52 0.24 292)', transform: 'rotate(-2deg)' }}>Maria Eduarda</div>
          <p className="text-[17px] leading-relaxed text-[oklch(0.28_0_0)] mt-7 max-w-[520px]">
            Transformo ideias em conteúdo que gera resultado. Atuo com estratégia, criação e gestão de redes sociais, unindo criatividade e dados para marcas que querem crescer de verdade no digital.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-7">
            {TAGS.map((tag) => (
              <div key={tag} className="border-[1.5px] border-[oklch(0.16_0_0/0.25)] px-4 py-2 rounded-full text-[13px] font-bold">{tag}</div>
            ))}
          </div>
          <div className="mt-9 pt-6 border-t border-[oklch(0.16_0_0/0.12)] font-bold text-[13px] tracking-wide uppercase">Marketing Digital</div>
        </Reveal>
        <Reveal id="sobre-photo" delay={0.15} onRegister={registerSection} className="relative flex-1 min-w-[200px] mx-auto" >
          <div
            ref={photo} onMouseMove={photoTilt.onMove} onMouseLeave={photoTilt.onLeave} onMouseEnter={cursorEnter}
            className="relative mx-auto" style={{ maxWidth: 'min(55vw,360px)' }}
          >
            <div className="w-full rounded-lg overflow-hidden grayscale contrast-[1.05] bg-[oklch(0.9_0.005_90)] flex items-center justify-center text-sm text-[oklch(0.5_0_0)]" style={{ aspectRatio: '4/5' }}>
              Foto de perfil (P&B)
            </div>
            <div
              className="absolute -bottom-3.5 -right-3.5 rounded-full bg-[oklch(0.52_0.24_292)] flex items-center justify-center font-[Anton] text-white text-center leading-tight"
              style={{ width: 'clamp(60px,15vw,90px)', height: 'clamp(60px,15vw,90px)', fontSize: 'clamp(10px,3vw,13px)', transform: 'rotate(-8deg)' }}
            >2026</div>
          </div>
        </Reveal>
      </div>

      {/* SERVIÇOS */}
      <div
        ref={services} onMouseMove={onServicesMove}
        className="relative bg-[oklch(0.16_0_0)] text-white"
        style={{ padding: 'clamp(56px,10vw,90px) clamp(20px,5vw,48px)', backgroundImage: 'radial-gradient(480px circle at var(--sx,50%) var(--sy,50%), oklch(0.52 0.24 292 / 0.22), transparent 60%)' }}
      >
        <div className="max-w-6xl mx-auto relative">
          <Reveal id="servicos-header" onRegister={registerSection}>
            <div className="font-[Anton]" style={{ fontSize: 'clamp(28px,7vw,40px)', marginBottom: 'clamp(32px,6vw,48px)' }}>O QUE EU FAÇO</div>
          </Reveal>
          <div className="grid gap-9" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
            {SERVICOS.map((s, i) => (
              <Reveal key={s.num} id={`servico-${i}`} delay={i * 0.1} onRegister={registerSection}>
                <div className="font-[Anton] text-4xl text-[oklch(0.52_0.24_292)]">{s.num}</div>
                <div className="text-lg font-extrabold mt-2.5">{s.titulo}</div>
                <div className="text-sm leading-relaxed text-[oklch(0.75_0_0)] mt-2">{s.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* CONTEÚDOS */}
      <div id="videos" className="max-w-6xl mx-auto" style={{ padding: 'clamp(56px,10vw,100px) clamp(20px,5vw,48px) clamp(48px,8vw,90px)' }}>
        <Reveal id="videos-header" onRegister={registerSection} className="flex items-end justify-between mb-10 flex-wrap gap-5">
          <div>
            <div className="text-[13px] font-bold tracking-widest uppercase text-[oklch(0.52_0.24_292)]">Carrossel</div>
            <div className="font-[Anton] leading-tight" style={{ fontSize: 'clamp(28px,7vw,44px)' }}>CONTEÚDOS EM DESTAQUE</div>
          </div>
          <div className="flex gap-3">
            <div ref={arrowLeft} onMouseMove={arrowLeftMag.onMove} onMouseLeave={arrowLeftMag.onLeave} onClick={() => scrollCarousel(-1)} onMouseEnter={cursorEnter}
              className="w-12 h-12 rounded-full border-[1.5px] border-[oklch(0.16_0_0/0.25)] flex items-center justify-center cursor-pointer text-xl transition-transform duration-200 active:scale-90 active:bg-[oklch(0.16_0_0)] active:text-white">←</div>
            <div ref={arrowRight} onMouseMove={arrowRightMag.onMove} onMouseLeave={arrowRightMag.onLeave} onClick={() => scrollCarousel(1)} onMouseEnter={cursorEnter}
              className="w-12 h-12 rounded-full border-[1.5px] border-[oklch(0.16_0_0/0.25)] flex items-center justify-center cursor-pointer text-xl transition-transform duration-200 active:scale-90 active:bg-[oklch(0.16_0_0)] active:text-white">→</div>
          </div>
        </Reveal>
        <div ref={carousel} className="flex gap-6 overflow-x-auto pb-2.5" style={{ scrollSnapType: 'x mandatory' }}>
          {VIDEOS_INFO.map((v, i) => (
            <VideoCard
              key={i} index={i} info={v} src={videoSrcs[i]} kind={mediaKinds[i]}
              cursorEnterLabel={cursorEnterLabel} cursorLeaveLabel={cursorLeaveLabel}
              registerSection={registerSection}
            />
          ))}
        </div>
      </div>

      {/* PROJETOS */}
      <div id="projetos" className="bg-[oklch(0.93_0.01_90)]" style={{ padding: 'clamp(56px,10vw,100px) clamp(20px,5vw,48px)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal id="projetos-header" onRegister={registerSection}>
            <div className="text-[13px] font-bold tracking-widest uppercase text-[oklch(0.52_0.24_292)]">Trabalhos</div>
            <div className="font-[Anton]" style={{ fontSize: 'clamp(28px,7vw,44px)', marginBottom: 'clamp(32px,6vw,48px)' }}>PROJETOS</div>
          </Reveal>
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))' }}>
            {PROJETOS.map((p, i) => (
              <Reveal key={p.titulo} id={`projeto-${i}`} delay={i * 0.1} onRegister={registerSection}>
                <div className="w-full rounded-[10px] overflow-hidden bg-[oklch(0.9_0.005_90)]" style={{ aspectRatio: '4/3' }}>
                  {p.embedUrl ? (
                    <iframe src={p.embedUrl} title={p.titulo} className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-[oklch(0.5_0_0)]">Imagem do projeto</div>
                  )}
                </div>
                <div className="mt-4.5 font-extrabold text-lg">{p.titulo}</div>
                <div className="text-sm leading-relaxed text-[oklch(0.4_0_0)] mt-1.5">{p.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* CONTATO */}
      <div id="contato" className="max-w-6xl mx-auto text-center" style={{ padding: 'clamp(64px,12vw,110px) clamp(20px,5vw,48px) clamp(40px,8vw,60px)' }}>
        <Reveal id="contato-header" onRegister={registerSection}>
          <div className="font-[Anton] leading-tight" style={{ fontSize: 'min(9vw,64px)' }}>
            VAMOS CRIAR ALGO<br />
            <span className="[font-family:'Miss_Fajardose'] inline-block" style={{ color: 'oklch(0.52 0.24 292)', fontSize: '1.9em', verticalAlign: 'middle', lineHeight: 0.6 }}>incrível</span> JUNTOS?
          </div>
        </Reveal>
        <div className="flex flex-col items-center gap-4 font-bold break-words" style={{ marginTop: 'clamp(32px,6vw,48px)', fontSize: 'clamp(14px,4vw,16px)' }}>
          <a ref={email} onMouseMove={emailMag.onMove} onMouseLeave={emailMag.onLeave} onMouseEnter={cursorEnter} href="mailto:dudinha.silveiraalves@gmail.com" className="inline-block transition-transform duration-200 active:scale-95">dudinha.silveiraalves@gmail.com</a>
          <a ref={whats} onMouseMove={whatsMag.onMove} onMouseLeave={whatsMag.onLeave} onMouseEnter={cursorEnter} href="https://wa.me/5551995068619" className="inline-block transition-transform duration-200 active:scale-95">(51) 99506-8619</a>
          <a ref={insta} onMouseMove={instaMag.onMove} onMouseLeave={instaMag.onLeave} onMouseEnter={cursorEnter} href="https://instagram.com/mariaesalvees" className="inline-block transition-transform duration-200 active:scale-95">@mariaesalvees</a>
        </div>
        <div className="pt-6 border-t border-[oklch(0.16_0_0/0.12)] text-[13px] text-[oklch(0.45_0_0)] flex justify-center text-center flex-wrap gap-3" style={{ marginTop: 'clamp(48px,10vw,90px)' }}>
          <div>Portfolio © 2026</div>
          <div>Maria Eduarda — Marketing Digital</div>
        </div>
      </div>
    </div>
  );
}

interface VideoInfo {
  titulo: string;
  tipo: string;
}

interface VideoCardProps {
  index: number;
  info: VideoInfo;
  src?: string;
  kind?: MediaKind;
  cursorEnterLabel: (label: string) => () => void;
  cursorLeaveLabel: () => void;
  registerSection: (id: string, el: HTMLElement, setVisible: (v: boolean) => void) => void;
}

function VideoCard({ index, info, src, kind, cursorEnterLabel, cursorLeaveLabel, registerSection }: VideoCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tilt = useTilt(tiltRef, 10);
  const hasVideo = !!src && kind !== 'image';
  const hasImage = !!src && kind === 'image';
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play(); else el.pause();
  };

  return (
    <Reveal id={`video-${index}`} delay={index * 0.08} onRegister={registerSection} className="flex-none" >
      <div style={{ width: 'min(62vw,320px)' }} className="active:scale-[0.97] transition-transform">
        <div
          ref={tiltRef}
          onMouseMove={tilt.onMove}
          onMouseLeave={() => { tilt.onLeave(); cursorLeaveLabel(); }}
          onMouseEnter={cursorEnterLabel('VER')}
          className="relative w-full rounded-2xl overflow-hidden bg-[oklch(0.9_0.005_90)] transition-transform duration-100"
          style={{ aspectRatio: '9/16' }}
        >
          {hasVideo && (
            <>
              <video
                ref={videoRef} src={src} controls playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover block bg-black"
              />
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute top-1/2 left-1/2 w-[60px] h-[60px] rounded-full bg-white/90 flex items-center justify-center cursor-pointer -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                >
                  <div className="w-0 h-0 border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent border-l-[18px] border-l-[oklch(0.16_0_0)] ml-1" />
                </div>
              )}
            </>
          )}
          {hasImage && (
            <img src={src} className="w-full h-full object-cover block" alt={info.titulo} />
          )}
          {!src && (
            <div className="w-full h-full flex items-center justify-center text-sm text-[oklch(0.5_0_0)]">Thumbnail do vídeo</div>
          )}
        </div>
        <div className="mt-3.5 font-bold text-[15px]">{info.titulo}</div>
        <div className="text-[13px] text-[oklch(0.45_0_0)] mt-0.5">{info.tipo}</div>
      </div>
    </Reveal>
  );
}
