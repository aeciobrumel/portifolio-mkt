# Portfolio — Maria Eduarda (Vite + React + Tailwind)

## Rodar localmente
```
npm install
npm run dev
```
Abre em http://localhost:5173

## Build
```
npm run build
npm run preview
```

## Conteúdo
- Edite `src/content.ts` para alterar serviços, projetos, vídeos/legendas e tags — não é preciso mexer em `src/Portfolio.tsx`.
- Cada item de `VIDEOS_INFO` aceita um `src` opcional (URL de vídeo ou imagem) e `kind` (`'video'` ou `'image'`) para já vir preenchido sem precisar fazer upload manual.

## Notas
- Tailwind v3 com valores arbitrários `oklch(...)` para as cores do design.
- Upload de foto/vídeo no carrossel usa `localStorage` (persiste ao recarregar, arquivos até 15MB) e tem prioridade sobre o `src` definido em `content.ts`.
- Cursor customizado, tilt 3D e magnetismo são desativados em telas touch.
- Troque o placeholder de "Foto de perfil" por uma imagem real em `src/Portfolio.tsx`.
