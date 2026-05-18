/* ═══════════════════════════════════════════════════════
   identidade_immersive.js — v3.0 (Multi-Versões)
   Motor LERP (Linear Interpolation) @ 0.075 independente
   Suporta as 4 versões na mesma página para comparação.
   Fase 1: Intro (0% - 25%) - Zoom / Cover / Shutter / Split
   Fase 2: Horizontal Scroll (25% - 70%)
   Fase 3: Spatial Stacking (70% - 100%)
   ═══════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const sections = document.querySelectorAll('.identidade-immersive');
    if (!sections.length) return;

    sections.forEach(section => {
        const trilho = section.querySelector('.id-trilho');
        const sCards = section.querySelectorAll('.id-stack-card');
        const phase2Videos = section.querySelectorAll('.id-slide-card__video iframe');
        const dashes = section.querySelectorAll('.id-video-indicator-dash');

        if (!trilho) return;

        // Determinar a versão baseado nas classes do elemento pai
        let version = 'original';
        if (section.classList.contains('id-version-a')) version = 'a';
        else if (section.classList.contains('id-version-b')) version = 'b';
        else if (section.classList.contains('id-version-c')) version = 'c';

        // LERP Motor vars (exclusivo desta seção)
        let currentScroll = window.pageYOffset;
        let targetScroll = window.pageYOffset;
        const amt = 0.075; // Assinatura visual premium

        let sectionTop = 0;
        let sectionHeight = 0;
        let isActive = false;
        let isMobile = window.innerWidth <= 768;

        function updateGeometry() {
            isMobile = window.innerWidth <= 768;
            sectionTop = section.offsetTop;
            if (isMobile) {
                // Mobile muito mais curto e dinâmico, eliminando scroll ocioso
                section.style.height = '260vh';
            } else {
                // Reduzido de 600vh para 420vh para um scroll super dinâmico e premium no desktop
                section.style.height = '420vh';
            }
            sectionHeight = section.offsetHeight;
        }

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        /**
         * ATUALIZAR TRAÇOS DO INDICADOR DE VÍDEO (Estilo Watch)
         */
        function updateDashes(activeIndex) {
            dashes.forEach((dash, idx) => {
                if (idx === activeIndex) {
                    dash.classList.add('active');
                } else {
                    dash.classList.remove('active');
                }
            });
        }

        /**
         * LOOP PRINCIPAL (RAF)
         */
        let lastProgress = -1;
        let isAnimating = false;

        function animate() {
            if (!isActive) {
                isAnimating = false;
                return;
            }

            currentScroll = lerp(currentScroll, targetScroll, amt);
            const scrollDiff = Math.abs(targetScroll - currentScroll);

            if (scrollDiff < 0.1) {
                currentScroll = targetScroll;
                isAnimating = false;
            } else {
                isAnimating = true;
                requestAnimationFrame(animate);
            }

            const scrollDistance = currentScroll - sectionTop;
            const totalScrollable = sectionHeight - window.innerHeight;
            let progress = scrollDistance / totalScrollable;
            progress = Math.max(0, Math.min(1, progress));

            if (Math.abs(progress - lastProgress) > 0.0001) {
                updatePhases(progress);
                lastProgress = progress;
            }
        }

        /**
         * MAPEAMENTO DE FASES E MOVIMENTOS EXCLUSIVOS
         */
        function updatePhases(progress) {
            // Parallax do vídeo de fundo
            section.style.setProperty('--id-bg-parallax-y', `${-progress * 80}px`);

            // Configuração dinâmica das fases dependendo do dispositivo (Fase 1 rápida a 15%)
            const p1End = 0.15;
            const p2Start = 0.15;
            const p2End = isMobile ? 0.55 : 0.65;
            const p3Start = isMobile ? 0.55 : 0.65;

            // --- FASE 1: INTRO ---
            let p1 = Math.min(progress / p1End, 1);

            if (version === 'original') {
                const zoom = 1 + (p1 * 3);
                section.style.setProperty('--id-zoom', zoom);
                section.style.setProperty('--id-title-opacity', 1 - (p1 * 2));
                section.style.setProperty('--id-title-y', `${-p1 * 50}px`);
            } 
            else if (version === 'a') {
                const zoom = 1 + (p1 * 0.08); 
                const yOffset = -p1 * 120;
                const opacity = 1 - p1;
                section.style.setProperty('--id-a-zoom', zoom);
                section.style.setProperty('--id-a-y', `${yOffset}px`);
                section.style.setProperty('--id-a-opacity', opacity);
                
                section.style.setProperty('--id-a-title-y', `${p1 * 30}px`);
                section.style.setProperty('--id-a-title-opacity', 1 - (p1 * 1.5));
            } 
            else if (version === 'b') {
                const cropPercent = 30 * (1 - p1);
                const zoom = 1 + (p1 * 0.05);
                const opacity = 1 - Math.max(0, (p1 - 0.8) * 5);
                section.style.setProperty('--id-b-crop', `${cropPercent}%`);
                section.style.setProperty('--id-b-zoom', zoom);
                section.style.setProperty('--id-b-opacity', opacity);

                section.style.setProperty('--id-b-title-opacity', 1 - (p1 * 1.8));
                section.style.setProperty('--id-b-title-y', `${-p1 * 20}px`);
            } 
            else if (version === 'c') {
                const leftY = -p1 * 150;
                const rightY = p1 * 100;
                const opacity = 1 - p1;
                section.style.setProperty('--id-c-left-y', `${leftY}px`);
                section.style.setProperty('--id-c-right-y', `${rightY}px`);
                section.style.setProperty('--id-c-opacity', opacity);
                
                section.style.setProperty('--id-c-title-opacity', 1 - (p1 * 1.5));
            }

            if (p1 > 0.95) {
                section.style.setProperty('--id-intro-opacity', 0);
                section.style.setProperty('--id-intro-visibility', 'hidden');
            } else {
                section.style.setProperty('--id-intro-opacity', 1);
                section.style.setProperty('--id-intro-visibility', 'visible');
            }

            // --- FASE 2: HORIZONTAL ---
            let p2 = progress > p2Start ? Math.min((progress - p2Start) / (p2End - p2Start), 1) : 0;

            let hOpacity = 1;

            if (isMobile) {
                // No mobile, desativamos o slide translation. A div fica centralizada.
                section.style.setProperty('--id-horizontal-x', `0px`);
                
                // Fade in suave e fade out no fim da fase
                if (p2 === 0) hOpacity = 0;
                else if (p2 > 0 && p2 < 0.2) hOpacity = p2 * 5;
                else if (p2 >= 0.2 && p2 <= 0.8) hOpacity = 1;
                else hOpacity = Math.max(0, 1 - ((p2 - 0.8) * 5));

            } else {
                const trilhoWidth = trilho.scrollWidth;
                const xOffset = p2 * (trilhoWidth + window.innerWidth * 0.2);
                section.style.setProperty('--id-horizontal-x', `${-xOffset + window.innerWidth * 0.85}px`);

                hOpacity = p2 > 0 && p2 < 1 ? 1 : (p2 === 0 ? 0 : 1 - (p2 - 0.9) * 10);
                if (p2 > 0.95) hOpacity = 1 - (p2 - 0.95) * 20;

                // No desktop, atualiza o indicador baseado no progresso LERP vertical
                const activeIndex = Math.max(0, Math.min(2, Math.floor(p2 * 3)));
                updateDashes(activeIndex);
            }
            
            section.style.setProperty('--id-horizontal-opacity', hOpacity);
            section.style.setProperty('--id-horizontal-events', hOpacity > 0.1 ? 'auto' : 'none');

            // --- FASE 3: STACKING ---
            let p3 = progress > p3Start ? (progress - p3Start) / (1 - p3Start) : 0;

            if (p3 > 0.01) {
                section.style.setProperty('--id-stack-opacity', 1);
                section.style.setProperty('--id-stack-visibility', 'visible');
            } else {
                section.style.setProperty('--id-stack-opacity', 0);
                section.style.setProperty('--id-stack-visibility', 'hidden');
            }

            const numCards = sCards.length;
            sCards.forEach((card, i) => {
                const cardStart = i / numCards;
                const cardEnd = (i + 1) / numCards;
                let cardProgress = p3 > cardStart ? Math.min((p3 - cardStart) / (cardEnd - cardStart), 1) : 0;

                const origin = card.getAttribute('data-origin') || 'bottom';
                let initX = 0, initY = 0;

                if (origin === 'top-left') { initX = -120; initY = -120; }
                else if (origin === 'top-right') { initX = 120; initY = -120; }
                else if (origin === 'bottom-left') { initX = -120; initY = 120; }
                else if (origin === 'bottom-right') { initX = 120; initY = 120; }
                else if (origin === 'left') { initX = -150; initY = 0; }
                else if (origin === 'right') { initX = 150; initY = 0; }
                else { initY = 150; }

                const currentX = initX + (0 - initX) * cardProgress;
                const currentY = initY + (0 - initY) * cardProgress;
                const currentRot = ((i % 2 === 0 ? 1 : -1) * (i * 2)) * cardProgress;

                let scale = 1;
                let overlayOpacity = 0;
                const nextCardStart = (i + 1) / numCards;
                if (p3 > nextCardStart) {
                    const sinkProgress = Math.min((p3 - nextCardStart) / (1 / numCards), 1);
                    scale = 1 - (sinkProgress * 0.05);
                    overlayOpacity = sinkProgress * 0.5;
                }

                card.style.setProperty('--id-card-x', `${currentX}%`);
                card.style.setProperty('--id-card-y', `${currentY}%`);
                card.style.setProperty('--id-card-rotate', `${currentRot}deg`);
                card.style.setProperty('--id-card-scale', scale);
                card.style.setProperty('--id-card-overlay', overlayOpacity);
            });
        }

        /**
         * EVENT LISTENERS
         */
        window.addEventListener('scroll', () => {
            targetScroll = window.pageYOffset;
            
            const scrollY = window.pageYOffset;
            const viewportHeight = window.innerHeight;
            if (scrollY + viewportHeight >= sectionTop && scrollY <= sectionTop + sectionHeight) {
                isActive = true;
            }

            if (isActive && !isAnimating) {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
        }, { passive: true });

        // Scroll horizontal nativo no Mobile para atualizar os indicadores estilo Watch
        trilho.addEventListener('scroll', () => {
            if (!isMobile) return;
            const card = trilho.querySelector('.id-slide-card');
            if (card) {
                const cardWidth = card.offsetWidth + 16; // width + gap (1rem)
                const activeIndex = Math.max(0, Math.min(2, Math.round(trilho.scrollLeft / cardWidth)));
                updateDashes(activeIndex);
            }
        }, { passive: true });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isActive = entry.isIntersecting;
                if (isActive) {
                    updateGeometry();
                    targetScroll = window.pageYOffset;
                    currentScroll = targetScroll;
                    if (!isAnimating) {
                        isAnimating = true;
                        requestAnimationFrame(animate);
                    }
                    // Carrega os iframes do Vimeo
                    phase2Videos.forEach(iframe => {
                        if (iframe.dataset.src && iframe.src !== iframe.dataset.src) {
                            iframe.src = iframe.dataset.src;
                        }
                    });
                } else {
                    // Descarrega para liberar CPU
                    phase2Videos.forEach(iframe => {
                        iframe.src = '';
                    });
                }
            });
        }, { threshold: 0 });

        observer.observe(section);

        window.addEventListener('resize', updateGeometry);
        window.addEventListener('load', updateGeometry); // Recalcula quando tudo carregar (imagens, fontes, frames)
        updateGeometry();
    });
})();
