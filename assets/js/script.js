document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando carregamento dos componentes...');

    // ===== SEMPRE USAR CAMINHOS ABSOLUTOS (começando com /) =====
    function getBasePath() {
        return ''; // vazio, pois usaremos /components/
    }

    const basePath = getBasePath();

    // ===== FUNÇÃO PARA CARREGAR COMPONENTES =====
    function carregarComponente(url, alvo, posicao) {
        console.log(`⏳ Carregando: ${url}`);
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                const elemento = document.querySelector(alvo);
                if (elemento) {
                    elemento.insertAdjacentHTML(posicao, html);
                    console.log(`✅ Componente carregado: ${url}`);
                } else {
                    console.warn(`⚠️ Elemento alvo "${alvo}" não encontrado. Inserindo no body.`);
                    document.body.insertAdjacentHTML(posicao, html);
                }
                return html;
            })
            .catch(error => {
                console.error(`❌ Erro ao carregar ${url}:`, error);
                const elemento = document.querySelector(alvo);
                if (elemento) {
                    elemento.insertAdjacentHTML(posicao, `
                        <div style="background:#ffe0e0; padding:12px; border:1px solid red; border-radius:8px; margin:10px 0; color:#333; font-family:sans-serif;">
                            ⚠️ Erro ao carregar componente. Verifique o console.
                            <br><small>Arquivo: ${url}</small>
                        </div>
                    `);
                }
                return '';
            });
    }

    // ===== CARREGA HEADER =====
    carregarComponente('/components/header.html', 'body', 'afterbegin')
        .then(() => {
            // Ativa o link correto no menu
            const currentPage = window.location.pathname;
            const mapa = {
                '/': 'link-inicio',
                '/index.html': 'link-inicio',
                '/pages/sobre.html': 'link-sobre',
                '/pages/podologia.html': 'link-podologia',
                '/pages/servicos.html': 'link-servicos',
                '/pages/blog.html': 'link-blog',
                '/pages/contato.html': 'link-contato'
            };
            const classe = mapa[currentPage];
            if (classe) {
                const link = document.querySelector(`.${classe}`);
                if (link) link.classList.add('ativo');
            }
            // Marca "Serviços" como ativo nas subpáginas do dropdown
            const subPaginasServicos = [
                '/pages/pe-diabetico.html',
                '/pages/unha-encravada.html'
            ];
            if (subPaginasServicos.includes(currentPage)) {
                const linkServicos = document.querySelector('.link-servicos');
                if (linkServicos) linkServicos.classList.add('ativo');
            }
            // Inicializa menu hambúrguer
            const menuToggle = document.getElementById('menuToggle');
            const nav = document.querySelector('nav');
            if (menuToggle && nav) {
                menuToggle.addEventListener('click', function() {
                    nav.classList.toggle('mobile-aberto');
                    menuToggle.classList.toggle('ativo');
                });
                document.querySelectorAll('nav ul li a').forEach(link => {
                    link.addEventListener('click', function() {
                        if (window.innerWidth <= 768) {
                            nav.classList.remove('mobile-aberto');
                            menuToggle.classList.remove('ativo');
                        }
                    });
                });
            }
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        });

    // ===== CARREGA FOOTER =====
    carregarComponente('/components/footer.html', 'body', 'beforeend')
        .then(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        });

    // ===== FAQ ACCORDION =====
    const faqPerguntas = document.querySelectorAll('.faq-pergunta');
    if (faqPerguntas.length) {
        faqPerguntas.forEach(pergunta => {
            pergunta.addEventListener('click', function() {
                const item = this.parentElement;
                const isOpen = item.classList.contains('aberto');
                document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('aberto'));
                if (!isOpen) {
                    item.classList.add('aberto');
                }
            });
        });
        // Removido: primeiro FAQ não abre mais automaticamente
    }

    console.log('✅ Script finalizado.');
});

/* =========================================================
   ===== MELHORIAS GRÁFICAS / INTERAÇÕES (v2) ==============
   Recursos puramente visuais: barra de progresso, botão
   "voltar ao topo", scroll reveal, contadores animados,
   parallax no hero e sombra do header ao rolar.
   Funciona em todas as páginas (CSS e JS compartilhados).
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

    // Respeita usuários que preferem menos movimento
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       1) BARRA DE PROGRESSO DE LEITURA
       --------------------------------------------------------- */
    const barraProgresso = document.createElement('div');
    barraProgresso.className = 'progresso-leitura';
    document.body.appendChild(barraProgresso);

    /* ---------------------------------------------------------
       2) BOTÃO "VOLTAR AO TOPO"
       --------------------------------------------------------- */
    const btnTopo = document.createElement('button');
    btnTopo.className = 'btn-topo';
    btnTopo.setAttribute('aria-label', 'Voltar ao topo');
    btnTopo.innerHTML = '<i data-feather="arrow-up"></i>';
    document.body.appendChild(btnTopo);
    if (typeof feather !== 'undefined') feather.replace();

    btnTopo.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    });

    /* ---------------------------------------------------------
       3) ATUALIZAÇÕES NO SCROLL (progresso, botão, header)
       --------------------------------------------------------- */
    const header = document.querySelector('header');

    function aoRolar() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
        const progresso = alturaTotal > 0 ? (scrollTop / alturaTotal) * 100 : 0;

        // Barra de progresso
        barraProgresso.style.width = progresso + '%';

        // Botão voltar ao topo (aparece após 400px)
        btnTopo.classList.toggle('visivel', scrollTop > 400);

        // Sombra do header
        if (header) header.classList.toggle('rolado', scrollTop > 20);

        // Parallax sutil no hero
        if (heroImagem && !reduzirMovimento && scrollTop < window.innerHeight) {
            heroImagem.style.transform = 'translateY(' + scrollTop * 0.08 + 'px)';
        }
    }

    // O header é carregado via fetch; tentamos novamente após pequeno delay
    let headerRef = header;
    function atualizarHeaderRef() {
        if (!headerRef) headerRef = document.querySelector('header');
    }
    setTimeout(atualizarHeaderRef, 300);
    setTimeout(atualizarHeaderRef, 800);

    /* ---------------------------------------------------------
       4) PARALLAX NO HERO
       --------------------------------------------------------- */
    const heroImagem = document.querySelector('.hero-imagem');

    // Throttle com requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                aoRolar();
                ticking = false;
            });
            ticking = true;
        }
    });
    aoRolar(); // estado inicial

    /* ---------------------------------------------------------
       5) SCROLL REVEAL (fade-in ao entrar na viewport)
       Atribui classes automaticamente aos elementos-chave.
       --------------------------------------------------------- */
    function prepararReveal() {
        // Seções de conteúdo individuais
        const alvosSimples = document.querySelectorAll(
            '.section-header, .podologia-texto, .podologia-imagem, .sobre-conteudo, ' +
            '.sobre-imagem, .depoimento-conteudo, .diferencial-destaque-conteudo, ' +
            '.cta-conteudo, .blog-cta, .servicos-cta'
        );
        alvosSimples.forEach(el => el.classList.add('reveal'));

        // Grades de cards recebem revelação escalonada
        const grades = document.querySelectorAll(
            '.servicos-grid, .diferenciais-grid, .areas-grid, .blog-grid, ' +
            '.diferencial-destaque-grid, .hero-info'
        );
        grades.forEach(el => el.classList.add('reveal-stagger'));
    }

    function observarReveal() {
        const elementos = document.querySelectorAll('.reveal, .reveal-stagger');
        if (!('IntersectionObserver' in window) || reduzirMovimento) {
            // Fallback: mostra tudo imediatamente
            elementos.forEach(el => el.classList.add('visivel'));
            return;
        }
        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visivel');
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        elementos.forEach(el => {
            if (!el.classList.contains('visivel')) observador.observe(el);
        });
    }

    prepararReveal();
    observarReveal();
    // Reobserva após o footer assíncrono carregar
    setTimeout(function () { prepararReveal(); observarReveal(); }, 600);

    /* ---------------------------------------------------------
       6) CONTADOR ANIMADO (ex.: "20 anos")
       Anima qualquer elemento com a classe .contador
       --------------------------------------------------------- */
    function animarContador(el) {
        const texto = el.textContent.trim();
        const match = texto.match(/(\d+)/); // primeiro número encontrado
        if (!match) return;

        const numeroFinal = parseInt(match[1], 10);
        const sufixo = texto.slice(match.index + match[1].length); // ex.: " anos"
        const prefixo = texto.slice(0, match.index);

        if (reduzirMovimento) { return; } // mantém o valor original

        const duracao = 1400;
        const inicio = performance.now();

        function passo(agora) {
            const progresso = Math.min((agora - inicio) / duracao, 1);
            // easing suave (easeOutCubic)
            const eased = 1 - Math.pow(1 - progresso, 3);
            const valorAtual = Math.round(eased * numeroFinal);
            el.textContent = prefixo + valorAtual + sufixo;
            if (progresso < 1) requestAnimationFrame(passo);
            else el.textContent = prefixo + numeroFinal + sufixo;
        }
        requestAnimationFrame(passo);
    }

    const contadores = document.querySelectorAll('.contador');
    if (contadores.length) {
        if (!('IntersectionObserver' in window)) {
            contadores.forEach(animarContador);
        } else {
            const obsContador = new IntersectionObserver(function (entradas) {
                entradas.forEach(entrada => {
                    if (entrada.isIntersecting) {
                        animarContador(entrada.target);
                        obsContador.unobserve(entrada.target);
                    }
                });
            }, { threshold: 0.6 });
            contadores.forEach(c => obsContador.observe(c));
        }
    }

    console.log('✅ Melhorias gráficas (v2) inicializadas.');
});
