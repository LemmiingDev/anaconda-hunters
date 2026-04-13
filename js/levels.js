const LEVELS = {
    1: {
        name: "Cruzar el Río",
        description: "Construyan un puente juntos para cruzar",
        background: '#1a5c1a',
        platforms: [],
        items: [],
        goal: {
            type: 'bridge',
            description: 'Ambos jugadores deben colocar troncos para formar el puente'
        },
        init: function(canvasWidth, canvasHeight) {
            const groundY = canvasHeight - 50;
            
            // Plataformas base
            this.platforms = [
                // Lado izquierdo (J1)
                { x: 0, y: groundY, width: canvasWidth/2 - 80, height: 50, color: '#3d2817' },
                // Lado derecho (J2)  
                { x: canvasWidth/2 + 80, y: groundY, width: canvasWidth/2 - 80, height: 50, color: '#3d2817' },
            ];
            
            // Río en el medio
            this.river = {
                x: canvasWidth/2 - 80,
                y: groundY,
                width: 160,
                height: 50
            };
            
            // Troncos que pueden recoger
            this.items = [
                { x: 50, y: groundY - 30, width: 60, height: 20, color: '#8B4513', type: 'log', collected: false },
                { x: canvasWidth - 110, y: groundY - 30, width: 60, height: 20, color: '#8B4513', type: 'log', collected: false }
            ];
            
            // Zonas donde colocar troncos
            this.bridgeZones = [
                { x: canvasWidth/2 - 60, y: groundY - 10, filled: false },
                { x: canvasWidth/2 + 20, y: groundY - 10, filled: false }
            ];
            
            this.bridgeComplete = false;
        },
        update: function(player1, player2, game) {
            // Recoger troncos
            this.items.forEach(item => {
                if (!item.collected) {
                    if (player1.collidesWith(item) && player1.isActioning && !player1.hasItem) {
                        player1.hasItem = item;
                        item.collected = true;
                        game.addCooperation(10);
                    }
                    if (player2.collidesWith(item) && player2.isActioning && !player2.hasItem) {
                        player2.hasItem = item;
                        item.collected = true;
                        game.addCooperation(10);
                    }
                }
            });
            
            // Colocar troncos en zonas del puente
            this.bridgeZones.forEach((zone, index) => {
                if (!zone.filled) {
                    const zoneRect = { x: zone.x, y: zone.y, width: 40, height: 20 };
                    
                    [player1, player2].forEach(player => {
                        if (player.hasItem && player.hasItem.type === 'log' && player.isActioning) {
                            if (Math.abs(player.x - zone.x) < 60) {
                                zone.filled = true;
                                player.hasItem = null;
                                game.addCooperation(25);
                                game.showMessage("¡Tronco colocado!");
                            }
                        }
                    });
                }
            });
            
            // Verificar si el puente está completo
            if (this.bridgeZones.every(z => z.filled) && !this.bridgeComplete) {
                this.bridgeComplete = true;
                game.showMessage("¡Puente construido! ¡Crucen juntos!");
                
                // Agregar el puente como plataforma
                this.platforms.push({
                    x: this.river.x,
                    y: this.river.y - 10,
                    width: this.river.width,
                    height: 20,
                    color: '#8B4513'
                });
            }
            
            // Verificar si ambos cruzaron
            if (this.bridgeComplete) {
                const canvasWidth = document.getElementById('game-canvas').width;
                const p1Crossed = player1.x > canvasWidth/2;
                const p2Crossed = player2.x < canvasWidth/2;
                
                // En este nivel, necesitamos que se encuentren en el medio
                if (Math.abs(player1.x - player2.x) < 100 && 
                    player1.x > canvasWidth/2 - 100 && player1.x < canvasWidth/2 + 100) {
                    game.completeLevel();
                }
            }
        },
        draw: function(ctx, canvasWidth, canvasHeight) {
            // Fondo de selva
            ctx.fillStyle = '#1a5c1a';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // Árboles de fondo
            this.drawTrees(ctx, canvasWidth, canvasHeight);
            
            // Río
            ctx.fillStyle = '#1e90ff';
            ctx.fillRect(this.river.x, this.river.y, this.river.width, this.river.height);
            
            // Ondas del agua
            ctx.strokeStyle = '#87CEEB';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.river.x, this.river.y + 15 + i * 15);
                for (let x = 0; x < this.river.width; x += 20) {
                    ctx.quadraticCurveTo(
                        this.river.x + x + 10, 
                        this.river.y + 10 + i * 15 + Math.sin(Date.now()/500 + x) * 5,
                        this.river.x + x + 20,
                        this.river.y + 15 + i * 15
                    );
                }
                ctx.stroke();
            }
            
            // Plataformas
            this.platforms.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                
                // Textura de tierra/madera
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                for (let i = 0; i < p.width; i += 20) {
                    ctx.fillRect(p.x + i, p.y, 2, p.height);
                }
            });
            
            // Zonas del puente
            this.bridgeZones.forEach(zone => {
                if (zone.filled) {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(zone.x, zone.y, 40, 20);
                } else {
                    ctx.strokeStyle = '#FFD700';
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(zone.x, zone.y, 40, 20);
                    ctx.setLineDash([]);
                }
            });
            
            // Items
            this.items.forEach(item => {
                if (!item.collected) {
                    ctx.fillStyle = item.color;
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    
                    // Textura de tronco
                    ctx.fillStyle = '#5D3A1A';
                    ctx.beginPath();
                    ctx.arc(item.x + 5, item.y + 10, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(item.x + item.width - 5, item.y + 10, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        },
        drawTrees: function(ctx, canvasWidth, canvasHeight) {
            const treePositions = [30, 100, canvasWidth - 100, canvasWidth - 30];
            treePositions.forEach(x => {
                // Tronco
                ctx.fillStyle = '#5D3A1A';
                ctx.fillRect(x - 10, canvasHeight - 150, 20, 100);
                
                // Copa
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.moveTo(x, canvasHeight - 200);
                ctx.lineTo(x - 40, canvasHeight - 120);
                ctx.lineTo(x + 40, canvasHeight - 120);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(x, canvasHeight - 230);
                ctx.lineTo(x - 30, canvasHeight - 170);
                ctx.lineTo(x + 30, canvasHeight - 170);
                ctx.closePath();
                ctx.fill();
            });
        }
    },
    
    2: {
        name: "Trepar los Árboles",
        description: "Ayúdense a subir usando las lianas",
        background: '#145214',
        platforms: [],
        lianas: [],
        goal: {
            type: 'climb',
            description: 'Ambos deben llegar a la plataforma superior'
        },
        init: function(canvasWidth, canvasHeight) {
            const groundY = canvasHeight - 50;
            
            this.platforms = [
                // Suelo
                { x: 0, y: groundY, width: canvasWidth, height: 50, color: '#3d2817' },
                // Plataformas escalonadas lado izquierdo
                { x: 20, y: groundY - 80, width: 80, height: 20, color: '#5D3A1A' },
                { x: 50, y: groundY - 160, width: 80, height: 20, color: '#5D3A1A' },
                // Plataformas lado derecho
                { x: canvasWidth - 100, y: groundY - 80, width: 80, height: 20, color: '#5D3A1A' },
                { x: canvasWidth - 130, y: groundY - 160, width: 80, height: 20, color: '#5D3A1A' },
                // Plataforma central alta (meta)
                { x: canvasWidth/2 - 60, y: groundY - 250, width: 120, height: 20, color: '#8B4513', isMeta: true }
            ];
            
            // Lianas que necesitan activarse cooperativamente
            this.lianas = [
                { 
                    x: canvasWidth/2 - 80, 
                    y: groundY - 300, 
                    height: 150, 
                    active: false,
                    activator: 'button1' // J1 debe activar
                },
                { 
                    x: canvasWidth/2 + 80, 
                    y: groundY - 300, 
                    height: 150, 
                    active: false,
                    activator: 'button2' // J2 debe activar
                }
            ];
            
            // Botones de activación
            this.buttons = [
                { x: 80, y: groundY - 100, width: 30, height: 10, id: 'button1', pressed: false },
                { x: canvasWidth - 110, y: groundY - 100, width: 30, height: 10, id: 'button2', pressed: false }
            ];
            
            this.completed = false;
        },
        update: function(player1, player2, game) {
            // Verificar botones
            this.buttons.forEach(btn => {
                btn.pressed = false;
                if (player1.collidesWith(btn) || player2.collidesWith(btn)) {
                    btn.pressed = true;
                    // Activar liana correspondiente
                    this.lianas.forEach(liana => {
                        if (liana.activator === btn.id) {
                            if (!liana.active) {
                                liana.active = true;
                                game.addCooperation(15);
                                game.showMessage("¡Liana activada!");
                            }
                        }
                    });
                }
            });
            
            // Las lianas actúan como plataformas cuando están activas
            this.lianas.forEach(liana => {
                if (liana.active) {
                    // Permitir trepar
                    [player1, player2].forEach(player => {
                        if (player.x > liana.x - 20 && player.x < liana.x + 20) {
                            if (player.y > liana.y && player.y < liana.y + liana.height) {
                                // Puede subir/bajar por la liana
                                if (player.isActioning) {
                                    player.velocityY = -8;
                                }
                            }
                        }
                    });
                }
            });
            
            // Verificar si ambos llegaron a la meta
            const meta = this.platforms.find(p => p.isMeta);
            if (meta) {
                const p1OnMeta = player1.y + player1.height >= meta.y - 5 && 
                                 player1.y + player1.height <= meta.y + 20 &&
                                 player1.x > meta.x && player1.x < meta.x + meta.width;
                const p2OnMeta = player2.y + player2.height >= meta.y - 5 && 
                                 player2.y + player2.height <= meta.y + 20 &&
                                 player2.x > meta.x && player2.x < meta.x + meta.width;
                
                if (p1OnMeta && p2OnMeta && !this.completed) {
                    this.completed = true;
                    game.completeLevel();
                }
            }
        },
        draw: function(ctx, canvasWidth, canvasHeight) {
            // Fondo
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // Árboles grandes de fondo
            this.drawJungleBackground(ctx, canvasWidth, canvasHeight);
            
            // Plataformas
            this.platforms.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                
                if (p.isMeta) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(p.x, p.y, p.width, p.height);
                    
                    ctx.fillStyle = '#FFD700';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('META', p.x + p.width/2, p.y - 5);
                }
            });
            
            // Botones
            this.buttons.forEach(btn => {
                ctx.fillStyle = btn.pressed ? '#00FF00' : '#FF4444';
                ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
                ctx.strokeStyle = '#FFFFFF';
                ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
            });
            
            // Lianas
            this.lianas.forEach(liana => {
                if (liana.active) {
                    ctx.strokeStyle = '#228B22';
                    ctx.lineWidth = 8;
                    ctx.beginPath();
                    ctx.moveTo(liana.x, liana.y);
                    // Dibujar liana con curvas
                    for (let i = 0; i < liana.height; i += 20) {
                        ctx.lineTo(liana.x + Math.sin(i/20) * 5, liana.y + i);
                    }
                    ctx.stroke();
                    
                    // Hojas
                    ctx.fillStyle = '#32CD32';
                    for (let i = 0; i < liana.height; i += 40) {
                        ctx.beginPath();
                        ctx.ellipse(liana.x + 10, liana.y + i, 15, 8, 0.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Liana inactiva (enrollada arriba)
                    ctx.fillStyle = '#666';
                    ctx.beginPath();
                    ctx.arc(liana.x, liana.y + 20, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#888';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('?', liana.x, liana.y + 24);
                }
            });
        },
        drawJungleBackground: function(ctx, canvasWidth, canvasHeight) {
            // Árboles de fondo
            for (let i = 0; i < 5; i++) {
                const x = (canvasWidth / 5) * i + 30;
                ctx.fillStyle = '#1a3d1a';
                ctx.fillRect(x, 0, 30, canvasHeight);
                
                // Ramas
                ctx.fillStyle = '#0d260d';
                for (let j = 50; j < canvasHeight; j += 80) {
                    ctx.beginPath();
                    ctx.moveTo(x + 15, j);
                    ctx.lineTo(x - 30, j + 20);
                    ctx.lineTo(x - 25, j + 30);
                    ctx.lineTo(x + 15, j + 15);
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.moveTo(x + 15, j + 10);
                    ctx.lineTo(x + 60, j + 30);
                    ctx.lineTo(x + 55, j + 40);
                    ctx.lineTo(x + 15, j + 25);
                    ctx.fill();
                }
            }
        }
    },
    
    3: {
        name: "El Pantano Traicionero",
        description: "Guíense mutuamente a través del pantano",
        background: '#0d3d0d',
        platforms: [],
        fog: [],
        goal: {
            type: 'navigate',
            description: 'Cada jugador ve diferente, deben guiarse'
        },
        init: function(canvasWidth, canvasHeight) {
            const groundY = canvasHeight - 50;
            
            // Plataformas seguras (algunas ocultas para cada jugador)
            this.platforms = [
                { x: 0, y: groundY, width: 80, height: 50, color: '#4a3728', safe: true },
                { x: canvasWidth - 80, y: groundY, width: 80, height: 50, color: '#4a3728', safe: true },
                // Camino de plataformas
                { x: 100, y: groundY - 20, width: 50, height: 30, color: '#3d2817', safe: true, visibleTo: 2 },
                { x: 170, y: groundY - 10, width: 50, height: 30, color: '#3d2817', safe: true, visibleTo: 1 },
                { x: 240, y: groundY - 25, width: 50, height: 30, color: '#3d2817', safe: true, visibleTo: 2 },
                { x: canvasWidth - 240, y: groundY - 25, width: 50, height: 30, color: '#3d2817', safe: true, visibleTo: 1 },
                { x: canvasWidth - 170, y: groundY - 10, width: 50, height: 30, color: '#3d2817', safe: true, visibleTo: 2 },
                { x: canvasWidth - 100, y: groundY - 20, width: 50, height: 30, color: '#3d2817', safe: true, visibleTo: 1 },
                // Plataforma central de encuentro
                { x: canvasWidth/2 - 40, y: groundY - 30, width: 80, height: 40, color: '#8B4513', safe: true, isMeta: true }
            ];
            
            // Pantano (zona de peligro)
            this.swamp = {
                x: 80,
                y: groundY,
                width: canvasWidth - 160,
                height: 50
            };
            
            // Sistema de señales
            this.signals = {
                player1: null,
                player2: null
            };
            
            this.completed = false;
        },
        update: function(player1, player2, game) {
            const canvasHeight = document.getElementById('game-canvas').height;
            const groundY = canvasHeight - 50;
            
            // Verificar si están en el pantano
            [player1, player2].forEach(player => {
                if (player.y + player.height > groundY - 5) {
                    const inSwamp = player.x > this.swamp.x && player.x < this.swamp.x + this.swamp.width;
                    
                    if (inSwamp) {
                        // Verificar si está en plataforma segura
                        let onSafePlatform = false;
                        this.platforms.forEach(p => {
                            if (player.collidesWith({...p, y: p.y - 10, height: p.height + 10})) {
                                onSafePlatform = true;
                            }
                        });
                        
                        if (!onSafePlatform) {
                            // Hundirse en el pantano
                            player.velocityY = 0.5;
                            game.addCooperation(-5);
                        }
                    }
                }
            });
            
            // Sistema de señales (cuando un jugador presiona acción)
            if (player1.isActioning) {
                this.signals.player1 = { x: player1.x, y: player1.y - 30, timer: 60 };
                game.addCooperation(2);
            }
            if (player2.isActioning) {
                this.signals.player2 = { x: player2.x, y: player2.y - 30, timer: 60 };
                game.addCooperation(2);
            }
            
            // Actualizar señales
            if (this.signals.player1) {
                this.signals.player1.timer--;
                if (this.signals.player1.timer <= 0) this.signals.player1 = null;
            }
            if (this.signals.player2) {
                this.signals.player2.timer--;
                if (this.signals.player2.timer <= 0) this.signals.player2 = null;
            }
            
            // Verificar meta
            const meta = this.platforms.find(p => p.isMeta);
            if (meta) {
                const p1OnMeta = player1.collidesWith(meta);
                const p2OnMeta = player2.collidesWith(meta);
                
                if (p1OnMeta && p2OnMeta && !this.completed) {
                    this.completed = true;
                    game.completeLevel();
                }
            }
        },
        draw: function(ctx, canvasWidth, canvasHeight, currentPlayer) {
            // Fondo pantanoso
            ctx.fillStyle = '#0d3d0d';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // Pantano
            ctx.fillStyle = '#2d4a2d';
            ctx.fillRect(this.swamp.x, this.swamp.y, this.swamp.width, this.swamp.height);
            
            // Burbujas del pantano
            ctx.fillStyle = '#4a6a4a';
            for (let i = 0; i < 10; i++) {
                const bx = this.swamp.x + (Math.sin(Date.now()/1000 + i) + 1) * this.swamp.width/2;
                const by = this.swamp.y + 10 + Math.abs(Math.sin(Date.now()/500 + i * 2)) * 30;
                ctx.beginPath();
                ctx.arc(bx, by, 5 + Math.sin(Date.now()/300 + i) * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Niebla en la mitad opuesta
            const fogSide = currentPlayer === 1 ? canvasWidth/2 : 0;
            ctx.fillStyle = 'rgba(100, 120, 100, 0.4)';
            ctx.fillRect(fogSide, 0, canvasWidth/2, canvasHeight);
            
            // Plataformas
            this.platforms.forEach(p => {
                // Algunas plataformas solo visibles para cierto jugador
                let alpha = 1;
                if (p.visibleTo) {
                    alpha = p.visibleTo === currentPlayer ? 1 : 0.2;
                }
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                
                if (p.isMeta) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(p.x, p.y, p.width, p.height);
                }
                
                // Vegetación en plataformas
                ctx.fillStyle = '#228B22';
                for (let i = 0; i < p.width; i += 15) {
                    ctx.beginPath();
                    ctx.moveTo(p.x + i, p.y);
                    ctx.lineTo(p.x + i + 5, p.y - 10);
                    ctx.lineTo(p.x + i + 10, p.y);
                    ctx.fill();
                }
                
                ctx.globalAlpha = 1;
            });
            
            // Señales de los jugadores
            if (this.signals.player1) {
                ctx.fillStyle = `rgba(74, 144, 217, ${this.signals.player1.timer / 60})`;
                ctx.beginPath();
                ctx.arc(this.signals.player1.x + 20, this.signals.player1.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('!', this.signals.player1.x + 20, this.signals.player1.y + 5);
            }
            if (this.signals.player2) {
                ctx.fillStyle = `rgba(217, 74, 74, ${this.signals.player2.timer / 60})`;
                ctx.beginPath();
                ctx.arc(this.signals.player2.x + 20, this.signals.player2.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('!', this.signals.player2.x + 20, this.signals.player2.y + 5);
            }
        }
    },
    
    4: {
        name: "¡Atrapar la Anaconda!",
        description: "¡Trabajen juntos para capturar a la anaconda gigante!",
        background: '#0a2a0a',
        init: function(canvasWidth, canvasHeight) {
            const groundY = canvasHeight - 50;
            
            this.platforms = [
                { x: 0, y: groundY, width: canvasWidth, height: 50, color: '#3d2817' },
                // Plataformas para rodear a la anaconda
                { x: 50, y: groundY - 80, width: 100, height: 20, color: '#5D3A1A' },
                { x: canvasWidth - 150, y: groundY - 80, width: 100, height: 20, color: '#5D3A1A' },
                { x: canvasWidth/2 - 50, y: groundY - 150, width: 100, height: 20, color: '#5D3A1A' }
            ];
            
            // La anaconda
            this.anaconda = {
                segments: [],
                headX: canvasWidth / 2,
                headY: groundY - 30,
                direction: 1,
                speed: 2,
                trapped: false,
                trapProgress: 0
            };
            
            // Generar segmentos de la anaconda
            for (let i = 0; i < 15; i++) {
                this.anaconda.segments.push({
                    x: this.anaconda.headX - i * 20,
                    y: this.anaconda.headY + Math.sin(i * 0.5) * 10
                });
            }
            
            // Redes para atrapar
            this.nets = [
                { x: 30, y: groundY - 40, collected: false, owner: null },
                { x: canvasWidth - 60, y: groundY - 40, collected: false, owner: null }
            ];
            
            // Puntos donde lanzar las redes
            this.trapZones = [
                { x: canvasWidth/2 - 100, y: groundY - 50, netPlaced: false },
                { x: canvasWidth/2 + 60, y: groundY - 50, netPlaced: false }
            ];
            
            this.completed = false;
            this.victoryTimer = 0;
        },
        update: function(player1, player2, game) {
            // Mover la anaconda
            if (!this.anaconda.trapped) {
                this.anaconda.headX += this.anaconda.direction * this.anaconda.speed;
                this.anaconda.headY += Math.sin(Date.now() / 500) * 0.5;
                
                const canvasWidth = document.getElementById('game-canvas').width;
                if (this.anaconda.headX > canvasWidth - 100 || this.anaconda.headX < 100) {
                    this.anaconda.direction *= -1;
                }
                
                // Actualizar segmentos (seguir la cabeza)
                for (let i = this.anaconda.segments.length - 1; i > 0; i--) {
                    this.anaconda.segments[i].x = this.anaconda.segments[i-1].x;
                    this.anaconda.segments[i].y = this.anaconda.segments[i-1].y;
                }
                this.anaconda.segments[0].x = this.anaconda.headX;
                this.anaconda.segments[0].y = this.anaconda.headY;
            }
            
            // Recoger redes
            this.nets.forEach(net => {
                if (!net.collected) {
                    if (player1.collidesWith({x: net.x, y: net.y, width: 30, height: 30}) && player1.isActioning) {
                        net.collected = true;
                        net.owner = 1;
                        player1.hasItem = { type: 'net', color: '#DDDD00' };
                        game.addCooperation(10);
                    }
                    if (player2.collidesWith({x: net.x, y: net.y, width: 30, height: 30}) && player2.isActioning) {
                        net.collected = true;
                        net.owner = 2;
                        player2.hasItem = { type: 'net', color: '#DDDD00' };
                        game.addCooperation(10);
                    }
                }
            });
            
            // Colocar redes en las zonas
            this.trapZones.forEach((zone, index) => {
                if (!zone.netPlaced) {
                    [player1, player2].forEach(player => {
                        if (player.hasItem && player.hasItem.type === 'net' && player.isActioning) {
                            if (Math.abs(player.x - zone.x) < 50 && Math.abs(player.y - zone.y) < 50) {
                                zone.netPlaced = true;
                                player.hasItem = null;
                                game.addCooperation(20);
                                game.showMessage("¡Red colocada!");
                            }
                        }
                    });
                }
            });
            
            // Verificar si la anaconda está atrapada
            if (this.trapZones.every(z => z.netPlaced) && !this.anaconda.trapped) {
                // Verificar si la anaconda está entre las redes
                const anacondaX = this.anaconda.headX;
                if (anacondaX > this.trapZones[0].x && anacondaX < this.trapZones[1].x + 40) {
                    this.anaconda.trapped = true;
                    game.showMessage("¡ANACONDA ATRAPADA!");
                    game.addCooperation(50);
                }
            }
            
            // Victoria
            if (this.anaconda.trapped) {
                this.victoryTimer++;
                this.anaconda.trapProgress = Math.min(100, this.victoryTimer);
                
                if (this.victoryTimer > 100 && !this.completed) {
                    this.completed = true;
                    game.victory();
                }
            }
        },
        draw: function(ctx, canvasWidth, canvasHeight) {
            // Fondo de selva profunda
            ctx.fillStyle = '#0a2a0a';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // Vegetación densa
            for (let i = 0; i < canvasWidth; i += 40) {
                ctx.fillStyle = '#0d3d0d';
                ctx.beginPath();
                ctx.moveTo(i, canvasHeight - 50);
                ctx.lineTo(i + 20, canvasHeight - 100 - Math.random() * 30);
                ctx.lineTo(i + 40, canvasHeight - 50);
                ctx.fill();
            }
            
            // Plataformas
            this.platforms.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
            });
            
            // Zonas de trampa
            this.trapZones.forEach(zone => {
                if (zone.netPlaced) {
                    // Red colocada
                    ctx.strokeStyle = '#DDDD00';
                    ctx.lineWidth = 3;
                    for (let i = 0; i < 40; i += 8) {
                        ctx.beginPath();
                        ctx.moveTo(zone.x + i, zone.y);
                        ctx.lineTo(zone.x + i, zone.y + 60);
                        ctx.stroke();
                    }
                    for (let i = 0; i < 60; i += 8) {
                        ctx.beginPath();
                        ctx.moveTo(zone.x, zone.y + i);
                        ctx.lineTo(zone.x + 40, zone.y + i);
                        ctx.stroke();
                    }
                } else {
                    // Zona indicada
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(zone.x, zone.y, 40, 60);
                    ctx.setLineDash([]);
                }
            });
            
            // Redes para recoger
            this.nets.forEach(net => {
                if (!net.collected) {
                    ctx.fillStyle = '#DDDD00';
                    ctx.fillRect(net.x, net.y, 30, 30);
                    ctx.strokeStyle = '#AA8800';
                    ctx.lineWidth = 2;
                    // Patrón de red
                    for (let i = 0; i < 30; i += 6) {
                        ctx.beginPath();
                        ctx.moveTo(net.x + i, net.y);
                        ctx.lineTo(net.x + i, net.y + 30);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(net.x, net.y + i);
                        ctx.lineTo(net.x + 30, net.y + i);
                        ctx.stroke();
                    }
                }
            });
            
            // La anaconda
            // Cuerpo
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 25;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(this.anaconda.segments[0].x, this.anaconda.segments[0].y);
            this.anaconda.segments.forEach((seg, i) => {
                if (i > 0) ctx.lineTo(seg.x, seg.y);
            });
            ctx.stroke();
            
            // Patrón de escamas
            ctx.strokeStyle = '#1B5E20';
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(this.anaconda.segments[0].x, this.anaconda.segments[0].y);
            this.anaconda.segments.forEach((seg, i) => {
                if (i > 0 && i % 2 === 0) ctx.lineTo(seg.x, seg.y);
            });
            ctx.stroke();
            
            // Cabeza
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.ellipse(this.anaconda.headX + this.anaconda.direction * 15, this.anaconda.headY, 20, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ojos
            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(this.anaconda.headX + this.anaconda.direction * 20, this.anaconda.headY - 5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.anaconda.headX + this.anaconda.direction * 21, this.anaconda.headY - 5, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Lengua
            ctx.strokeStyle = '#C62828';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.anaconda.headX + this.anaconda.direction * 30, this.anaconda.headY);
            ctx.lineTo(this.anaconda.headX + this.anaconda.direction * 45, this.anaconda.headY - 5);
            ctx.moveTo(this.anaconda.headX + this.anaconda.direction * 40, this.anaconda.headY);
            ctx.lineTo(this.anaconda.headX + this.anaconda.direction * 45, this.anaconda.headY + 5);
            ctx.stroke();
            
            // Indicador de captura
            if (this.anaconda.trapped) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(canvasWidth/2 - 100, 20, 200, 30);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(canvasWidth/2 - 100, 20, this.anaconda.trapProgress * 2, 30);
                
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('¡CAPTURANDO!', canvasWidth/2, 42);
            }
        }
    }
};
