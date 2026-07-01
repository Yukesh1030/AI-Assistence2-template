// JavaScript Interactivity for Stackly Clone & Extensions

document.addEventListener('DOMContentLoaded', () => {
    initOSDetection();
    initThemeSwitcher();
    initNavigation();
    initScrollAnimations();
    initIDESimulator();
    
    // Extensions initializations
    initTypingAnimation();
    initFloatingAIOrb();
    initTiltCards();
    initMapNodes();
    initRoiCalculator();
    initFaqAccordion();
    initParallaxCards();
    initDashboardTabs();
    initAuthFlow();
});

/* ==========================================
   1. OS Detection for Download Buttons
   ========================================== */
function initOSDetection() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    let osName = 'Windows';
    let downloadUrl = '404.html';

    if (userAgent.indexOf('macintosh') !== -1 || userAgent.indexOf('mac os x') !== -1) {
        osName = 'macOS';
    } else if (userAgent.indexOf('linux') !== -1) {
        osName = 'Linux';
    }

    // Update all download CTA labels and hrefs
    const downloadBtns = document.querySelectorAll('.btn-download-cta');
    downloadBtns.forEach(btn => {
        // Keep download symbol structure if present
        if (btn.id === 'hero-download-btn' || btn.id === 'cta-download-btn') {
            btn.innerHTML = `Download for ${osName} <span class="btn-icon">⤓</span>`;
        } else if (btn.classList.contains('mobile-download-cta')) {
            btn.textContent = `Download for ${osName}`;
        }
        btn.href = downloadUrl;
    });
}

/* ==========================================
   2. Theme Switcher (System, Light, Dark)
   ========================================== */
function initThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;

    const themeButtons = switcher.querySelectorAll('.theme-switch-btn');
    
    // Check local storage or default to system
    let savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedTheme = btn.getAttribute('data-theme-val');
            applyTheme(selectedTheme);
        });
    });

    function applyTheme(theme) {
        // Toggle active classes on buttons
        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-theme-val') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Set state on document
        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
            localStorage.setItem('theme', 'system');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }

    // Monitor system theme changes if theme is set to system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/* ==========================================
   3. Navigation, Dropdowns, and Mobile Menu
   ========================================== */
function initNavigation() {
    const header = document.getElementById('site-header');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDropdown = document.getElementById('mobile-dropdown-menu');
    if (!header || !mobileToggle || !mobileDropdown) return;
    
    const openIcon = mobileToggle.querySelector('.menu-open-icon');
    const closeIcon = mobileToggle.querySelector('.menu-close-icon');

    // Sticky Header Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    mobileToggle.addEventListener('click', () => {
        const isHidden = mobileDropdown.classList.contains('hidden');
        if (isHidden) {
            mobileDropdown.classList.remove('hidden');
            openIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            mobileToggle.setAttribute('aria-expanded', 'true');
        } else {
            mobileDropdown.classList.add('hidden');
            openIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close mobile menu on clicking any navigation link
    const mobileLinks = mobileDropdown.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDropdown.classList.add('hidden');
            openIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Simple keyboard accessibility for navbar dropdown buttons
    const dropdownBtns = document.querySelectorAll('.nav-btn-link');
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            
            // Close all dropdowns
            dropdownBtns.forEach(b => b.setAttribute('aria-expanded', 'false'));
            
            btn.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
        });
    });

    // Close open dropdowns when clicking elsewhere
    document.addEventListener('click', () => {
        dropdownBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    });
}

/* ==========================================
   4. Scroll Reveal Animations
   ========================================== */
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));
}

/* ==========================================
   5. Interactive IDE Simulator Logic
   ========================================== */
function initIDESimulator() {
    const promptInput = document.getElementById('sim-prompt-input');
    const submitBtn = document.getElementById('sim-submit-btn');
    const codeOutput = document.getElementById('editor-code-output');
    if (!promptInput || !submitBtn || !codeOutput) return;

    const tabBtns = document.querySelectorAll('.ide-tab');
    const panes = document.querySelectorAll('.ide-pane');
    const lineNumbers = document.getElementById('editor-line-numbers');
    const terminalBody = document.getElementById('ide-terminal-body');
    const taskStatus = document.getElementById('task-status-lbl');
    const suggestionBtns = document.querySelectorAll('.suggest-btn');
    const explorerFiles = document.querySelectorAll('.file-item');
    const activeFileTab = document.querySelector('.active-tab-file');

    let isRunning = false;

    // Simulation presets data
    const simulations = {
        "header": {
            fileName: "index.html",
            fileClass: "file-html",
            linesCount: 16,
            code: `<span class="code-comment">&lt;!-- Simulated Glassmorphism Header --&gt;</span>
&lt;<span class="code-tag">header</span> <span class="code-attr">class</span>=<span class="code-str">"site-header glass"</span>&gt;
    &lt;<span class="code-tag">div</span> <span class="code-attr">class</span>=<span class="code-str">"nav-container"</span>&gt;
        &lt;<span class="code-tag">a</span> <span class="code-attr">href</span>=<span class="code-str">"#"</span> <span class="code-attr">class</span>=<span class="code-str">"logo"</span>&gt;Acme Labs&lt;/<span class="code-tag">a</span>&gt;
        &lt;<span class="code-tag">nav</span>&gt;
            &lt;<span class="code-tag">ul</span>&gt;
                &lt;<span class="code-tag">li</span>&gt;&lt;<span class="code-tag">a</span> <span class="code-attr">href</span>=<span class="code-str">"#features"</span>&gt;Features&lt;/<span class="code-tag">a</span>&gt;&lt;/<span class="code-tag">li</span>&gt;
                &lt;<span class="code-tag">li</span>&gt;&lt;<span class="code-tag">a</span> <span class="code-attr">href</span>=<span class="code-str">"#pricing"</span>&gt;Pricing&lt;/<span class="code-tag">a</span>&gt;&lt;/<span class="code-tag">li</span>&gt;
            &lt;/<span class="code-tag">ul</span>&gt;
        &lt;/<span class="code-tag">nav</span>&gt;
    &lt;/<span class="code-tag">div</span>&gt;
&lt;/<span class="code-tag">header</span>&gt;`,
            terminalLogs: [
                "→ Parsing request: 'Build a glassmorphism landing page header'",
                "Analyzing active files...",
                "Editing index.html: replacing lines 1-6 with new header definition.",
                "Applying CSS classes & validating structure...",
                "✓ index.html updated successfully."
            ]
        },
        "grid": {
            fileName: "styles.css",
            fileClass: "file-css",
            linesCount: 12,
            code: `<span class="code-comment">/* Simulated Responsive Grid */</span>
<span class="code-tag">.projects-grid</span> {
    <span class="code-attr">display</span>: grid;
    <span class="code-attr">grid-template-columns</span>: repeat(auto-fit, minmax(<span class="code-str">300px</span>, <span class="code-str">1fr</span>));
    <span class="code-attr">gap</span>: <span class="code-str">24px</span>;
    <span class="code-attr">margin</span>: <span class="code-str">48px 0</span>;
}
<span class="code-tag">.grid-card</span> {
    <span class="code-attr">border</span>: 1px solid var(--border);
    <span class="code-attr">border-radius</span>: <span class="code-str">12px</span>;
}`,
            terminalLogs: [
                "→ Parsing request: 'Add responsive grid layout for projects'",
                "Found target file: styles.css",
                "Appending projects grid styles rules...",
                "Verifying CSS syntax...",
                "✓ styles.css successfully compiled."
            ]
        },
        "switcher": {
            fileName: "script.js",
            fileClass: "file-js",
            linesCount: 14,
            code: `<span class="code-comment">// Simulated Interactive Switcher</span>
<span class="code-tag">const</span> toggleTheme = () =&gt; {
    <span class="code-tag">const</span> current = document.documentElement.getAttribute(<span class="code-str">'data-theme'</span>);
    <span class="code-tag">const</span> target = current === <span class="code-str">'dark'</span> ? <span class="code-str">'light'</span> : <span class="code-str">'dark'</span>;
    
    document.documentElement.setAttribute(<span class="code-str">'data-theme'</span>, target);
    localStorage.setItem(<span class="code-str">'theme'</span>, target);
    
    console.log(<span class="code-str">\`Theme toggled: \${target}\`</span>);
};
document.getElementById(<span class="code-str">'theme-toggle-btn'</span>).addEventListener(<span class="code-str">'click'</span>, toggleTheme);`,
            terminalLogs: [
                "→ Parsing request: 'Create an interactive dark theme switcher'",
                "Found target file: script.js",
                "Injecting theme toggle event listeners...",
                "Running compiler checks...",
                "✓ script.js successfully integrated with UI."
            ]
        }
    };

    // Tab buttons toggle
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPaneId = btn.getAttribute('data-target');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetPaneId).classList.add('active');
        });
    });

    // Explorer files selector clicks
    explorerFiles.forEach(file => {
        file.addEventListener('click', () => {
            if (isRunning) return;
            explorerFiles.forEach(f => f.classList.remove('selected'));
            file.classList.add('selected');
            
            const fileName = file.textContent;
            activeFileTab.textContent = fileName;
            
            // Show corresponding empty shell depending on file type selected
            if (fileName === 'index.html') {
                resetEditorToDefault();
            } else if (fileName === 'styles.css') {
                codeOutput.innerHTML = `<span class="code-comment">/* Select a CSS suggestion or type custom instructions below */</span>`;
                updateLineNumbers(1);
            } else {
                codeOutput.innerHTML = `<span class="code-comment">// Select a JavaScript suggestion or type custom instructions below</span>`;
                updateLineNumbers(1);
            }
        });
    });

    // Clicking suggestions filling text area
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;
            const promptText = btn.getAttribute('data-prompt');
            promptInput.value = promptText;
            
            // Trigger auto-submit
            runSimulation();
        });
    });

    // Submit prompt actions
    submitBtn.addEventListener('click', () => {
        runSimulation();
    });

    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            runSimulation();
        }
    });

    function resetEditorToDefault() {
        activeFileTab.textContent = 'index.html';
        explorerFiles.forEach(f => f.classList.remove('selected'));
        document.querySelector('.file-html').classList.add('selected');
        
        codeOutput.innerHTML = `<span class="code-comment">&lt;!-- Try out the interactive demo below by clicking a suggestion! --&gt;</span>
&lt;<span class="code-tag">div</span> <span class="code-attr">class</span>=<span class="code-str">"hero"</span>&gt;
    &lt;<span class="code-tag">h1</span>&gt;Coding at the speed of thought&lt;/<span class="code-tag">h1</span>&gt;
    &lt;<span class="code-tag">p</span>&gt;Build ambitious apps with Stackly Agent.&lt;/<span class="code-tag">p</span>&gt;
    &lt;<span class="code-tag">button</span>&gt;Get Started&lt;/<span class="code-tag">button</span>&gt;
&lt;/<span class="code-div">div</span>&gt;`;
        updateLineNumbers(6);
    }

    function updateLineNumbers(count) {
        lineNumbers.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const numDiv = document.createElement('div');
            numDiv.textContent = i;
            lineNumbers.appendChild(numDiv);
        }
    }

    function runSimulation() {
        if (isRunning) return;
        
        const userInput = promptInput.value.trim();
        if (!userInput) return;

        isRunning = true;
        promptInput.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Running...";

        // Pick matching simulation block
        let targetSim = simulations.header; // fallback
        const lowerInput = userInput.toLowerCase();
        
        if (lowerInput.includes('grid') || lowerInput.includes('projects')) {
            targetSim = simulations.grid;
        } else if (lowerInput.includes('switcher') || lowerInput.includes('theme')) {
            targetSim = simulations.switcher;
        } else if (lowerInput.includes('header') || lowerInput.includes('glassmorphism')) {
            targetSim = simulations.header;
        }

        // Set explorer focus tab
        explorerFiles.forEach(f => {
            if (f.classList.contains(targetSim.fileClass)) {
                f.classList.add('selected');
                activeFileTab.textContent = targetSim.fileName;
            } else {
                f.classList.remove('selected');
            }
        });

        // Initialize terminal lines
        terminalBody.innerHTML = '';
        addTerminalLine(`$ stackly --agent "${userInput}"`, 'system');

        // Step-by-step state animations
        taskStatus.textContent = "Reading files...";
        taskStatus.style.color = "var(--text-secondary)";

        setTimeout(() => {
            // Step 2
            taskStatus.textContent = "Running Agent (1/3)";
            addTerminalLine(targetSim.terminalLogs[0], 'info');
            addTerminalLine(targetSim.terminalLogs[1]);
        }, 1000);

        setTimeout(() => {
            // Step 3
            taskStatus.textContent = "Applying Edits (2/3)";
            addTerminalLine(targetSim.terminalLogs[2]);
            addTerminalLine(targetSim.terminalLogs[3]);
            
            // Render lines typing simulation in Editor
            animateCodeTyping(targetSim.code, targetSim.linesCount);
        }, 2200);

        setTimeout(() => {
            // Step 4 - Finish
            taskStatus.textContent = "Completed (3/3)";
            taskStatus.style.color = "#10b981";
            addTerminalLine(targetSim.terminalLogs[4], 'success');
            addTerminalLine("✓ Server re-compiled in 420ms", 'success');
            
            // Re-enable controls
            isRunning = false;
            promptInput.disabled = false;
            submitBtn.disabled = false;
            submitBtn.textContent = "Run Agent";
            promptInput.value = '';
        }, 4500);
    }

    function addTerminalLine(text, type = '') {
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.textContent = text;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function animateCodeTyping(htmlContent, totalLines) {
        codeOutput.innerHTML = '';
        updateLineNumbers(totalLines);

        // Split HTML lines to animate them slowly
        const lines = htmlContent.split('\n');
        let currentLine = 0;

        const interval = setInterval(() => {
            if (currentLine < lines.length) {
                codeOutput.innerHTML += (currentLine > 0 ? '\n' : '') + lines[currentLine];
                currentLine++;
            } else {
                clearInterval(interval);
            }
        }, 120);
    }
}

/* ==========================================
   6. Typing Animation Effect
   ========================================== */
function initTypingAnimation() {
    const typingEls = document.querySelectorAll('.typing-text');
    typingEls.forEach(el => {
        const wordsStr = el.getAttribute('data-words');
        if (!wordsStr) return;
        const words = wordsStr.split(',').map(w => w.trim());
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                el.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                el.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 40 : 80;
            
            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 1500; // Pause at end of word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 300; // Brief pause before typing next word
            }
            
            setTimeout(type, typeSpeed);
        }
        
        setTimeout(type, 500);
    });
}

/* ==========================================
   7. Canvas-based Floating AI Orb
   ========================================== */
function initFloatingAIOrb() {
    const canvas = document.getElementById('floating-ai-orb');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    window.addEventListener('resize', () => {
        if (!canvas) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });
    
    const particles = [];
    const particleCount = 60;
    const orbRadius = Math.min(width, height) * 0.35;
    
    // Create random spherical particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            theta: Math.random() * Math.PI * 2,
            phi: Math.acos((Math.random() * 2) - 1),
            speedTheta: (Math.random() - 0.5) * 0.015,
            speedPhi: (Math.random() - 0.5) * 0.015,
            size: Math.random() * 3 + 1,
            color: i % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(168, 85, 247, 0.7)' // Cyan and Purple
        });
    }
    
    function animate() {
        if (!canvas) return;
        ctx.clearRect(0, 0, width, height);
        
        // Draw center core glow
        const centerX = width / 2;
        const centerY = height / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 0.8);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbit rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, orbRadius * 0.9, orbRadius * 0.3, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, orbRadius * 0.9, orbRadius * 0.4, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Update & project particles onto 2D screen
        particles.forEach(p => {
            p.theta += p.speedTheta;
            p.phi += p.speedPhi;
            
            // Convert spherical coords to 3D Cartesian coords
            const x = orbRadius * Math.sin(p.phi) * Math.cos(p.theta);
            const y = orbRadius * Math.sin(p.phi) * Math.sin(p.theta);
            const z = orbRadius * Math.cos(p.phi);
            
            // Perspective Projection (scale size based on depth z)
            const scale = (z + orbRadius * 1.5) / (orbRadius * 2);
            const projectedX = centerX + x;
            const projectedY = centerY + y;
            const size = p.size * scale;
            
            // Draw particle
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* ==========================================
   8. 3D Card Tilt Effect
   ========================================== */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        // Ensure neon glow boundary element exists
        if (!card.querySelector('.glow-border')) {
            const glow = document.createElement('div');
            glow.className = 'glow-border';
            card.appendChild(glow);
        }
        
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt degrees (max 10deg)
            const rotateX = -(y - centerY) / (centerY / 10);
            const rotateY = (x - centerX) / (centerX / 10);
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Set dynamic background gradient position on the glow border
            const glow = card.querySelector('.glow-border');
            if (glow) {
                const percentX = (x / rect.width) * 100;
                const percentY = (y / rect.height) * 100;
                glow.style.background = `radial-gradient(circle 120px at ${percentX}% ${percentY}%, rgba(56, 189, 248, 0.4), rgba(168, 85, 247, 0.2), transparent)`;
                glow.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            const glow = card.querySelector('.glow-border');
            if (glow) {
                glow.style.opacity = '0';
            }
        });
    });
}

/* ==========================================
   9. Enterprise Canvas World Map Network Nodes
   ========================================== */
function initMapNodes() {
    const canvas = document.getElementById('enterprise-map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    window.addEventListener('resize', () => {
        if (!canvas) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });
    
    const nodes = [];
    const nodeCount = 35;
    
    // Generate nodes representing enterprise hubs
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 4 + 2,
            pulseRadius: 0,
            pulseSpeed: Math.random() * 0.05 + 0.02,
            color: i % 3 === 0 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(168, 85, 247, 0.8)'
        });
    }
    
    function animate() {
        if (!canvas) return;
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid lines in the background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw connections
        ctx.lineWidth = 1;
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (dist < 120) {
                    const alpha = (1 - (dist / 120)) * 0.15;
                    ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw & update nodes
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            
            // Bounce bounds
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
            
            // Draw pulse glow ring
            n.pulseRadius += n.pulseSpeed;
            if (n.pulseRadius > 20) n.pulseRadius = 0;
            const pulseAlpha = 1 - (n.pulseRadius / 20);
            
            ctx.strokeStyle = n.color.replace('0.8', (pulseAlpha * 0.4).toString());
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + n.pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw core node
            ctx.fillStyle = n.color;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* ==========================================
   10. Interactive ROI Calculator
   ========================================== */
function initRoiCalculator() {
    const slider = document.querySelector('.calc-slider');
    const teamCountLabel = document.getElementById('calc-team-count');
    const hoursSavedLabel = document.getElementById('calc-hours-saved');
    const dollarsSavedLabel = document.getElementById('calc-dollars-saved');
    
    if (!slider || !teamCountLabel) return;
    
    function updateCalculations() {
        const teamSize = parseInt(slider.value, 10);
        teamCountLabel.textContent = teamSize;
        
        // Let's assume an average developer saves 6 hours per week with our tools
        const hoursSaved = teamSize * 6;
        hoursSavedLabel.textContent = hoursSaved.toLocaleString() + ' hrs';
        
        // Let's assume average billing is $65/hr
        const dollarsSaved = hoursSaved * 65 * 4; // monthly savings
        dollarsSavedLabel.textContent = '$' + dollarsSaved.toLocaleString();
    }
    
    slider.addEventListener('input', updateCalculations);
    updateCalculations(); // Init
}

/* ==========================================
   11. FAQ Accordion Expanding logic
   ========================================== */
function initFaqAccordion() {
    const triggers = document.querySelectorAll('.faq-trigger');
    triggers.forEach(trig => {
        trig.addEventListener('click', () => {
            const item = trig.closest('.faq-item');
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            // Toggle
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* ==========================================
   12. Parallax Scroll / Parallax Mouse wrappers
   ========================================== */
function initParallaxCards() {
    const scrollContainer = document.querySelector('.horizontal-scroll-container');
    if (!scrollContainer) return;
    
    scrollContainer.addEventListener('mousemove', e => {
        const layers = scrollContainer.querySelectorAll('.parallax-layer');
        const rect = scrollContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        layers.forEach(layer => {
            const depth = parseFloat(layer.getAttribute('data-depth') || '0.2');
            const shiftX = (x - rect.width / 2) * depth * 0.05;
            layer.style.transform = `translateX(${shiftX}px)`;
        });
    });
    
    // Enable timeline scroll progress visual connection on Enterprise page
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
        const activeLine = timelineContainer.querySelector('.timeline-line-active');
        const timelineItems = timelineContainer.querySelectorAll('.timeline-item');
        
        window.addEventListener('scroll', () => {
            const rect = timelineContainer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate timeline scroll ratio
            const relativeTop = rect.top - windowHeight / 2;
            const totalHeight = rect.height;
            let progress = -relativeTop / totalHeight;
            progress = Math.max(0, Math.min(1, progress));
            
            if (activeLine) {
                activeLine.style.height = `${progress * 100}%`;
            }
            
            timelineItems.forEach((item, index) => {
                const itemPercent = (index + 0.5) / timelineItems.length;
                if (progress >= itemPercent) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    }
}

/* ==========================================
   13. Dashboard Tab Switching Panel Logic
   ========================================== */
function initDashboardTabs() {
    const navButtons = document.querySelectorAll('.dashboard-nav-btn');
    if (navButtons.length === 0) return;
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Skip logout button
            if (btn.closest('.dashboard-logout-btn')) return;
            
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;
            
            // Toggle active button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle active content pane
            const panes = document.querySelectorAll('.dashboard-pane');
            panes.forEach(p => p.classList.remove('active'));
            
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    // Logout action handler
    const logoutBtn = document.querySelector('.logout-action');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear current user state in session/local storage if needed
            localStorage.removeItem('currentUser');
            alert('Successfully logged out.');
            window.location.href = 'login.html';
        });
    }
}

/* ==========================================
   14. Authentication signup/login validation
   ========================================== */
function initAuthFlow() {
    // Signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Registration successful! Redirecting to login...');
            window.location.href = 'login.html';
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            
            // Save entered username/email to sessionStorage (same as Blockchain Applications)
            if (emailInput) {
                let username = emailInput.value.trim() || 'User';
                if (username.includes('@')) {
                    username = username.split('@')[0];
                }
                sessionStorage.setItem('username', username);
            }
            
            const roleSelect = document.getElementById('loginAs');
            const selectedRole = roleSelect ? roleSelect.value : 'Client';
            
            if (selectedRole === 'Admin') {
                window.location.href = 'AdminDashboard.html';
            } else {
                window.location.href = 'ClientDashboard.html';
            }
        });
    }
    
    function showError(msg) {
        const errorEl = document.getElementById('auth-error-msg');
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }
    }
    
    // Button Ripple Effect
    const rippleButtons = document.querySelectorAll('.auth-btn');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            btn.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}
