import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RobloxAvatar, AvatarCustomization } from './RobloxAvatar';
import { CompetitorBot } from '../types/game';

export interface TowerSceneConfig {
  container: HTMLDivElement;
  avatarCustomization: AvatarCustomization;
  onLavaProximityChange?: (proximity: number) => void;
}

export class TowerScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private pmrem: THREE.PMREMGenerator;

  public isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private lastTime: number = 0;

  // Main Entities
  public playerAvatar: RobloxAvatar;
  public competitorAvatars: Map<string, RobloxAvatar> = new Map();
  private competitorTowers: Map<string, THREE.Group> = new Map();

  // Player Tower
  public playerTowerGroup: THREE.Group;
  private playerBlocks: THREE.Mesh[] = [];

  // Lava & Arena
  private lavaPlane: THREE.Mesh;
  private lavaGlowLight: THREE.PointLight;
  private keyLight: THREE.DirectionalLight;
  private emberParticles: THREE.InstancedMesh;
  private emberCount: number = 60;
  private emberData: { pos: THREE.Vector3; speed: number; rotSpeed: number }[] = [];

  // Lava physics
  public lavaHeight: number = -2; // starts below ground level
  public playerHeightMeters: number = 0; // blocks count * 2m

  // Camera tracking & shake
  private cameraTarget = new THREE.Vector3(0, 4, 0);
  private cameraOffset = new THREE.Vector3(0, 6, 14);
  private trauma: number = 0;
  public isTitleScreen: boolean = true;
  private titleOrbitAngle: number = 0;

  // Audio callback
  private onLavaProximityChange?: (proximity: number) => void;

  // Shared Geometries & Materials (reusable, zero GC)
  private blockGeo: THREE.BoxGeometry;
  private studGeo: THREE.CylinderGeometry;
  private blockMat: THREE.MeshStandardMaterial;
  private botBlockMat: THREE.MeshStandardMaterial;

  constructor(config: TowerSceneConfig) {
    this.container = config.container;
    this.onLavaProximityChange = config.onLavaProximityChange;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance'
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x180f1e); // Atmospheric deep volcanic twilight
    this.scene.fog = new THREE.FogExp2(0x180f1e, 0.012);

    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 400);
    this.camera.position.set(0, 10, 24);

    // 4. RoomEnvironment for Studio PBR Reflections
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0x7fb5ff, 0x3d1a10, 0.7);
    this.scene.add(hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffedd0, 1.3);
    this.keyLight.position.set(15, 30, 20);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 120;
    const d = 25;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Molten lava upward glow light
    this.lavaGlowLight = new THREE.PointLight(0xff5511, 2.8, 45, 1.2);
    this.lavaGlowLight.position.set(0, 0, 0);
    this.scene.add(this.lavaGlowLight);

    // 6. Pre-allocate Shared Geometries & Materials
    this.blockGeo = new THREE.BoxGeometry(4.2, 1.8, 4.2);
    this.studGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 16);

    // Player blocks: Vibrant Roblox Red with bright studs
    this.blockMat = new THREE.MeshStandardMaterial({
      color: 0xcc2233,
      roughness: 0.35,
      metalness: 0.1
    });

    // Bot competitor blocks: Vibrant Teal / Cobalt
    this.botBlockMat = new THREE.MeshStandardMaterial({
      color: 0x2266aa,
      roughness: 0.4,
      metalness: 0.1
    });

    // 7. Player Avatar
    this.playerAvatar = new RobloxAvatar(config.avatarCustomization);
    this.playerAvatar.setPosition(0, 1.8, 0);
    this.scene.add(this.playerAvatar.group);

    // 8. Player Tower Group & Initial Base
    this.playerTowerGroup = new THREE.Group();
    this.playerTowerGroup.position.set(0, 0, 0);
    this.scene.add(this.playerTowerGroup);

    // Add base foundation block
    this.addPlayerBlock(0);

    // 9. Molten Lava Lake
    this.lavaPlane = this.createLavaPlane();
    this.lavaPlane.position.y = this.lavaHeight;
    this.scene.add(this.lavaPlane);

    // 10. Volcanic Caldera Backdrop & Cliffs
    this.buildVolcanicArena();

    // 11. Rising Fire & Ember Particles
    this.emberParticles = this.createEmberParticles();
    this.scene.add(this.emberParticles);

    // 12. Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 13. Window Resize Listener
    window.addEventListener('resize', this.onWindowResize);

    // 14. Start Render Loop
    this.lastTime = performance.now();
    this.tick();
  }

  /**
   * Procedural procedural lava plane with magma texture
   */
  private createLavaPlane(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(160, 160, 32, 32);
    geo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Magma gradient & noise
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#ff3300');
    grad.addColorStop(0.3, '#ff7700');
    grad.addColorStop(0.6, '#cc1100');
    grad.addColorStop(1, '#ffaa00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Dark cooling crust patches
    ctx.fillStyle = '#440900';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 15 + Math.random() * 35;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      emissive: new THREE.Color(0xff4400),
      emissiveIntensity: 0.85,
      roughness: 0.7,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Surrounding volcanic cliffs, pillars, and arena scenery
   */
  private buildVolcanicArena() {
    const arenaGroup = new THREE.Group();

    // Dark basalt rock pillars encircling the tower pit
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1f1824,
      roughness: 0.85,
      metalness: 0.1
    });

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const radius = 28 + (i % 3) * 4;
      const height = 40 + Math.random() * 30;
      const pillarGeo = new THREE.CylinderGeometry(2.5, 4.0, height, 6);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(
        Math.cos(angle) * radius,
        height / 2 - 10,
        Math.sin(angle) * radius
      );
      pillar.castShadow = !this.isSoftwareGl;
      pillar.receiveShadow = !this.isSoftwareGl;
      arenaGroup.add(pillar);
    }

    // Sky clouds / atmospheric rings at higher altitudes
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e5c,
      transparent: true,
      opacity: 0.35,
      roughness: 0.9
    });
    for (let c = 0; c < 8; c++) {
      const ringGeo = new THREE.TorusGeometry(35 + c * 3, 3, 6, 24);
      ringGeo.rotateX(Math.PI / 2);
      const cloud = new THREE.Mesh(ringGeo, cloudMat);
      cloud.position.y = 40 + c * 15;
      arenaGroup.add(cloud);
    }

    this.scene.add(arenaGroup);
  }

  /**
   * Instanced Mesh for floating volcanic embers
   */
  private createEmberParticles(): THREE.InstancedMesh {
    const geo = new THREE.DodecahedronGeometry(0.18);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      wireframe: false
    });

    const mesh = new THREE.InstancedMesh(geo, mat, this.emberCount);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.emberCount; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = Math.random() * 40;
      const z = (Math.random() - 0.5) * 35;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.6 + Math.random() * 0.8);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      this.emberData.push({
        pos: new THREE.Vector3(x, y, z),
        speed: 1.5 + Math.random() * 2.5,
        rotSpeed: 1 + Math.random() * 3
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  /**
   * Spawns competitor bot towers
   */
  public initCompetitors(bots: CompetitorBot[]) {
    // Clear any previous competitor towers
    this.competitorAvatars.forEach((avatar) => {
      this.scene.remove(avatar.group);
      avatar.dispose();
    });
    this.competitorAvatars.clear();

    this.competitorTowers.forEach((tower) => {
      this.scene.remove(tower);
    });
    this.competitorTowers.clear();

    const positions = [
      { x: -6.5, z: 2 },
      { x: 6.5, z: 2 },
      { x: -13, z: 4 },
      { x: 13, z: 4 }
    ];

    bots.forEach((bot, idx) => {
      const pos = positions[idx % positions.length];
      const towerGroup = new THREE.Group();
      towerGroup.position.set(pos.x, 0, pos.z);
      this.scene.add(towerGroup);
      this.competitorTowers.set(bot.id, towerGroup);

      // Create base block
      this.addBotBlock(bot.id, 0);

      // Create bot avatar
      const botAvatar = new RobloxAvatar({
        skinColor: bot.avatarColor,
        torsoColor: bot.shirtColor,
        legsColor: '#222233',
        hatType: bot.hatType
      });
      botAvatar.setPosition(pos.x, 1.8, pos.z);
      this.scene.add(botAvatar.group);
      this.competitorAvatars.set(bot.id, botAvatar);
    });
  }

  /**
   * Spawns real remote multiplayer competitor towers
   */
  public initMultiplayerCompetitors(players: { id: string; name: string; height: number; avatar: AvatarCustomization; isAlive: boolean }[], localPlayerId: string) {
    this.competitorAvatars.forEach((avatar) => {
      this.scene.remove(avatar.group);
      avatar.dispose();
    });
    this.competitorAvatars.clear();

    this.competitorTowers.forEach((tower) => {
      this.scene.remove(tower);
    });
    this.competitorTowers.clear();

    const otherPlayers = players.filter((p) => p.id !== localPlayerId);
    const positions = [
      { x: -6.5, z: 2 },
      { x: 6.5, z: 2 },
      { x: -13, z: 4 },
      { x: 13, z: 4 },
      { x: -19.5, z: 6 },
      { x: 19.5, z: 6 }
    ];

    otherPlayers.forEach((player, idx) => {
      const pos = positions[idx % positions.length];
      const towerGroup = new THREE.Group();
      towerGroup.position.set(pos.x, 0, pos.z);
      this.scene.add(towerGroup);
      this.competitorTowers.set(player.id, towerGroup);

      const blockCount = Math.max(1, Math.floor(player.height / 2));
      for (let h = 0; h < blockCount; h++) {
        this.addBotBlock(player.id, h);
      }

      const avatar = new RobloxAvatar(player.avatar);
      avatar.setPosition(pos.x, blockCount * 1.8, pos.z);
      this.scene.add(avatar.group);
      this.competitorAvatars.set(player.id, avatar);
    });
  }

  public triggerPlayerEliminated(playerId: string) {
    const avatar = this.competitorAvatars.get(playerId);
    if (avatar) avatar.triggerFall();
  }

  /**
   * Adds a block with 4 Roblox studs to the player's tower
   */
  public addPlayerBlock(heightIndex: number) {
    const yPos = heightIndex * 1.8;
    const blockMesh = new THREE.Mesh(this.blockGeo, this.blockMat);
    blockMesh.position.set(0, yPos + 0.9, 0);
    blockMesh.castShadow = !this.isSoftwareGl;
    blockMesh.receiveShadow = !this.isSoftwareGl;

    // Add 4 classic Roblox circular studs on top
    const studOffsets = [
      [-1.1, -1.1],
      [1.1, -1.1],
      [-1.1, 1.1],
      [1.1, 1.1]
    ];
    studOffsets.forEach(([sx, sz]) => {
      const stud = new THREE.Mesh(this.studGeo, this.blockMat);
      stud.position.set(sx, 0.9 + 0.11, sz);
      blockMesh.add(stud);
    });

    this.playerTowerGroup.add(blockMesh);
    this.playerBlocks.push(blockMesh);
    this.playerHeightMeters = (heightIndex + 1) * 2;

    // Move player avatar atop the newly added block
    if (this.playerAvatar) {
      this.playerAvatar.setPosition(0, (heightIndex + 1) * 1.8, 0);
      this.playerAvatar.triggerJump();
    }

    // Trigger trauma camera shake
    this.trauma = Math.min(this.trauma + 0.35, 1.0);
  }

  /**
   * Adds a block to a competitor's tower
   */
  public addBotBlock(botId: string, heightIndex: number) {
    const tower = this.competitorTowers.get(botId);
    if (!tower) return;

    const yPos = heightIndex * 1.8;
    const blockMesh = new THREE.Mesh(this.blockGeo, this.botBlockMat);
    blockMesh.position.set(0, yPos + 0.9, 0);

    const studOffsets = [
      [-1.1, -1.1],
      [1.1, -1.1],
      [-1.1, 1.1],
      [1.1, 1.1]
    ];
    studOffsets.forEach(([sx, sz]) => {
      const stud = new THREE.Mesh(this.studGeo, this.botBlockMat);
      stud.position.set(sx, 0.9 + 0.11, sz);
      blockMesh.add(stud);
    });

    tower.add(blockMesh);

    // Move bot avatar
    const avatar = this.competitorAvatars.get(botId);
    if (avatar) {
      avatar.setPosition(tower.position.x, (heightIndex + 1) * 1.8, tower.position.z);
      avatar.triggerJump();
    }
  }

  /**
   * Updates lava elevation
   */
  public setLavaHeight(height: number) {
    this.lavaHeight = height;
    this.lavaPlane.position.y = this.lavaHeight;
    this.lavaGlowLight.position.y = this.lavaHeight + 2;

    // Proximity to player's feet (playerHeightMeters)
    const distanceToFeet = this.playerHeightMeters - this.lavaHeight;
    const proximity = Math.max(0, Math.min(1 - distanceToFeet / 12, 1));
    if (this.onLavaProximityChange) {
      this.onLavaProximityChange(proximity);
    }
  }

  /**
   * Resets tower for new run
   */
  public resetScene() {
    // Clear all player blocks except base 0
    while (this.playerBlocks.length > 1) {
      const b = this.playerBlocks.pop()!;
      this.playerTowerGroup.remove(b);
    }
    this.playerHeightMeters = 2;
    this.lavaHeight = -2;
    this.lavaPlane.position.y = -2;
    this.playerAvatar.isFalling = false;
    this.playerAvatar.isCheering = false;
    this.playerAvatar.group.rotation.set(0, 0, 0);
    this.playerAvatar.setPosition(0, 1.8, 0);
    this.cameraTarget.set(0, 4, 0);
  }

  /**
   * Updates avatar skin or colors when customized in UI
   */
  public updateAvatarCustomization(cust: AvatarCustomization) {
    const currentY = this.playerAvatar.group.position.y;
    this.scene.remove(this.playerAvatar.group);
    this.playerAvatar.dispose();
    this.playerAvatar = new RobloxAvatar(cust);
    this.playerAvatar.setPosition(0, currentY, 0);
    this.scene.add(this.playerAvatar.group);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Frame tick with clamped dt and software-WebGL safety
   */
  private tick = () => {
    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    this.updateSimulation(dt);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.animFrameId = requestAnimationFrame(this.tick);
    }
  };

  /**
   * Software-WebGL fence synchronization
   */
  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  /**
   * Advances simulation, particles, camera tracking
   */
  private updateSimulation(dt: number) {
    // 1. Update player avatar animations
    this.playerAvatar.update(dt);

    // 2. Update competitor bot avatar animations
    this.competitorAvatars.forEach((avatar) => avatar.update(dt));

    // 3. Update floating ember particles
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.emberCount; i++) {
      const e = this.emberData[i];
      e.pos.y += e.speed * dt;
      // Reset if risen too high above lava
      if (e.pos.y > this.lavaHeight + 35) {
        e.pos.y = this.lavaHeight + 0.5;
        e.pos.x = (Math.random() - 0.5) * 35;
        e.pos.z = (Math.random() - 0.5) * 35;
      }
      dummy.position.copy(e.pos);
      dummy.rotation.x += e.rotSpeed * dt;
      dummy.rotation.y += e.rotSpeed * dt * 0.7;
      dummy.scale.setScalar(0.7);
      dummy.updateMatrix();
      this.emberParticles.setMatrixAt(i, dummy.matrix);
    }
    this.emberParticles.instanceMatrix.needsUpdate = true;

    // 4. Camera control
    if (this.isTitleScreen) {
      // Cinematic slow orbit around tower
      this.titleOrbitAngle += dt * 0.25;
      const radius = 22;
      this.camera.position.x = Math.sin(this.titleOrbitAngle) * radius;
      this.camera.position.z = Math.cos(this.titleOrbitAngle) * radius;
      this.camera.position.y = 8 + Math.sin(this.titleOrbitAngle * 0.5) * 2;
      this.camera.lookAt(0, 4, 0);
    } else {
      // Smooth tracking to follow player's tower top
      const targetY = this.playerAvatar.group.position.y + 2.5;
      this.cameraTarget.y = THREE.MathUtils.damp(this.cameraTarget.y, targetY, 4, dt);
      this.cameraTarget.x = THREE.MathUtils.damp(this.cameraTarget.x, 0, 4, dt);
      this.cameraTarget.z = THREE.MathUtils.damp(this.cameraTarget.z, 0, 4, dt);

      // Desired camera position
      const desiredPos = new THREE.Vector3(
        this.cameraTarget.x + this.cameraOffset.x,
        this.cameraTarget.y + this.cameraOffset.y,
        this.cameraTarget.z + this.cameraOffset.z
      );

      // Decay camera trauma shake
      if (this.trauma > 0) {
        this.trauma = Math.max(0, this.trauma - dt * 1.5);
        const shake = this.trauma * this.trauma;
        desiredPos.x += (Math.random() - 0.5) * shake * 0.8;
        desiredPos.y += (Math.random() - 0.5) * shake * 0.8;
      }

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, desiredPos.x, 5, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, desiredPos.y, 5, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, desiredPos.z, 5, dt);

      this.camera.lookAt(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);

      // Move key light up as player climbs so shadows stay crisp
      this.keyLight.position.y = this.playerAvatar.group.position.y + 25;
      this.keyLight.target.position.y = this.playerAvatar.group.position.y;
      this.keyLight.target.updateMatrixWorld();
    }
  }

  public dispose() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      clearTimeout(this.animFrameId);
    }

    this.playerAvatar.dispose();
    this.competitorAvatars.forEach((avatar) => avatar.dispose());
    this.competitorAvatars.clear();

    this.blockGeo.dispose();
    this.studGeo.dispose();
    this.blockMat.dispose();
    this.botBlockMat.dispose();

    this.pmrem.dispose();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
