import * as THREE from 'three';

export interface AvatarCustomization {
  skinColor: string; // e.g. '#FFD900' (Roblox Classic Yellow)
  torsoColor: string; // e.g. '#0055BF' (Classic Blue)
  legsColor: string; // e.g. '#267326' (Classic Green)
  hatType: 'noob' | 'bacon' | 'fedora' | 'crown' | 'valk';
}

export class RobloxAvatar {
  public group: THREE.Group;
  public head: THREE.Mesh;
  public torso: THREE.Mesh;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public hatGroup: THREE.Group;
  public shadowDisc: THREE.Mesh;

  private leftArmMesh: THREE.Mesh;
  private rightArmMesh: THREE.Mesh;
  private leftLegMesh: THREE.Mesh;
  private rightLegMesh: THREE.Mesh;

  private animTimer: number = 0;
  private jumpTimer: number = 0;
  private cheerTimer: number = 0;
  private fallTimer: number = 0;
  public isFalling: boolean = false;
  public isCheering: boolean = false;

  constructor(customization: AvatarCustomization) {
    this.group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.skinColor),
      roughness: 0.6,
      metalness: 0.05
    });

    const torsoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.torsoColor),
      roughness: 0.5,
      metalness: 0.1
    });

    const legMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.legsColor),
      roughness: 0.6,
      metalness: 0.05
    });

    // 1. Torso: Box (1.6w x 1.6h x 0.8d)
    const torsoGeo = new THREE.BoxGeometry(1.6, 1.6, 0.8);
    this.torso = new THREE.Mesh(torsoGeo, torsoMat);
    this.torso.position.y = 1.6; // Center at y=1.6 (legs are 1.6 high)
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.group.add(this.torso);

    // Torso Roblox Stud on chest (small emblem)
    const emblemGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
    const emblemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0.4, 0.35, 0.42);
    this.torso.add(emblem);

    // 2. Head with Procedural Face Texture (1.0 x 1.0 x 1.0)
    const headGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const faceTex = this.createFaceTexture();
    const faceMaterials = [
      skinMat, // right
      skinMat, // left
      skinMat, // top
      skinMat, // bottom
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 }), // front face
      skinMat  // back
    ];
    this.head = new THREE.Mesh(headGeo, faceMaterials);
    this.head.position.y = 2.9; // atop torso (1.6 + 0.8 + 0.5)
    this.head.castShadow = true;
    this.group.add(this.head);

    // Head top stud (classic Lego/Roblox stud on head)
    const headStudGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 16);
    const headStud = new THREE.Mesh(headStudGeo, skinMat);
    headStud.position.y = 0.58;
    this.head.add(headStud);

    // 3. Left Arm with shoulder pivot
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-1.2, 2.3, 0);
    const armGeo = new THREE.BoxGeometry(0.75, 1.6, 0.75);
    this.leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    this.leftArmMesh.position.y = -0.7; // hang down from shoulder pivot
    this.leftArmMesh.castShadow = true;
    this.leftArm.add(this.leftArmMesh);
    this.group.add(this.leftArm);

    // 4. Right Arm with shoulder pivot
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(1.2, 2.3, 0);
    this.rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    this.rightArmMesh.position.y = -0.7;
    this.rightArmMesh.castShadow = true;
    this.rightArm.add(this.rightArmMesh);
    this.group.add(this.rightArm);

    // 5. Left Leg with hip pivot
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.42, 1.6, 0);
    const legGeo = new THREE.BoxGeometry(0.76, 1.6, 0.78);
    this.leftLegMesh = new THREE.Mesh(legGeo, legMat);
    this.leftLegMesh.position.y = -0.8;
    this.leftLegMesh.castShadow = true;
    this.leftLeg.add(this.leftLegMesh);
    this.group.add(this.leftLeg);

    // 6. Right Leg with hip pivot
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.42, 1.6, 0);
    this.rightLegMesh = new THREE.Mesh(legGeo, legMat);
    this.rightLegMesh.position.y = -0.8;
    this.rightLegMesh.castShadow = true;
    this.rightLeg.add(this.rightLegMesh);
    this.group.add(this.rightLeg);

    // 7. Hat / Accessory
    this.hatGroup = new THREE.Group();
    this.createHat(customization.hatType);
    this.head.add(this.hatGroup);

    // 8. Contact shadow disc beneath the character
    const shadowGeo = new THREE.CircleGeometry(1.1, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.02;
    this.group.add(this.shadowDisc);
  }

  /**
   * Procedural Roblox classic smiling face on a 2D canvas texture
   */
  private createFaceTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Yellow background
    ctx.fillStyle = '#FFD900';
    ctx.fillRect(0, 0, 256, 256);

    // Big black eyes
    ctx.fillStyle = '#111111';
    // Left eye
    ctx.beginPath();
    ctx.arc(80, 105, 18, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(75, 100, 6, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(176, 105, 18, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(171, 100, 6, 0, Math.PI * 2);
    ctx.fill();

    // Classic cheerful Roblox curve smile
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 140, 50, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Builds procedural 3D hats
   */
  private createHat(type: AvatarCustomization['hatType']) {
    // Clear any previous hat meshes
    while (this.hatGroup.children.length > 0) {
      this.hatGroup.remove(this.hatGroup.children[0]);
    }

    if (type === 'noob') {
      // Blue ballcap
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, roughness: 0.4 });
      const capGeo = new THREE.BoxGeometry(1.08, 0.35, 1.08);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.58;

      // Visor
      const visorGeo = new THREE.BoxGeometry(0.9, 0.08, 0.5);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 0.45, 0.7);
      visor.rotation.x = 0.15;

      this.hatGroup.add(cap);
      this.hatGroup.add(visor);
    } else if (type === 'crown') {
      // Golden Crown with ruby
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.85, roughness: 0.2 });
      const crownBase = new THREE.CylinderGeometry(0.55, 0.55, 0.3, 16);
      const crown = new THREE.Mesh(crownBase, goldMat);
      crown.position.y = 0.65;

      // Spikes
      for (let i = 0; i < 5; i++) {
        const spikeGeo = new THREE.ConeGeometry(0.12, 0.3, 4);
        const spike = new THREE.Mesh(spikeGeo, goldMat);
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.5, 0.25, Math.sin(angle) * 0.5);
        crown.add(spike);
      }

      // Ruby in center front
      const rubyGeo = new THREE.DodecahedronGeometry(0.1);
      const rubyMat = new THREE.MeshStandardMaterial({ color: 0xee1133, roughness: 0.1, metalness: 0.1 });
      const ruby = new THREE.Mesh(rubyGeo, rubyMat);
      ruby.position.set(0, 0, 0.56);
      crown.add(ruby);

      this.hatGroup.add(crown);
    } else if (type === 'fedora') {
      // Classic Fedora
      const fedoraMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
      const brimGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.06, 24);
      const brim = new THREE.Mesh(brimGeo, fedoraMat);
      brim.position.y = 0.52;

      const topGeo = new THREE.CylinderGeometry(0.48, 0.54, 0.45, 24);
      const top = new THREE.Mesh(topGeo, fedoraMat);
      top.position.y = 0.75;

      // Red ribbon
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xdd1122, roughness: 0.5 });
      const ribbonGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 24);
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.y = 0.59;

      this.hatGroup.add(brim);
      this.hatGroup.add(top);
      this.hatGroup.add(ribbon);
    } else if (type === 'bacon') {
      // Bacon hair (layered dark brown locks)
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.9 });
      for (let i = -2; i <= 2; i++) {
        const lockGeo = new THREE.BoxGeometry(0.24, 0.75, 0.35);
        const lock = new THREE.Mesh(lockGeo, hairMat);
        lock.position.set(i * 0.22, 0.5 + Math.abs(i) * -0.05, 0.45);
        lock.rotation.x = -0.25;
        this.hatGroup.add(lock);
      }
      const topHair = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.3, 1.05), hairMat);
      topHair.position.y = 0.6;
      this.hatGroup.add(topHair);
    } else if (type === 'valk') {
      // Valkyrie Helm (Wings on sides)
      const helmMat = new THREE.MeshStandardMaterial({ color: 0x334466, metalness: 0.6, roughness: 0.3 });
      const goldAccent = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 16), helmMat);
      cap.position.y = 0.65;
      this.hatGroup.add(cap);

      // Wing flaps left & right
      const wingGeo = new THREE.BoxGeometry(0.08, 0.6, 0.35);
      const leftWing = new THREE.Mesh(wingGeo, goldAccent);
      leftWing.position.set(-0.65, 0.8, 0);
      leftWing.rotation.z = -0.3;

      const rightWing = new THREE.Mesh(wingGeo, goldAccent);
      rightWing.position.set(0.65, 0.8, 0);
      rightWing.rotation.z = 0.3;

      this.hatGroup.add(leftWing);
      this.hatGroup.add(rightWing);
    }
  }

  /**
   * Triggers jump squash and stretch when ascending to next block
   */
  public triggerJump() {
    this.jumpTimer = 0.45;
  }

  public triggerCheer() {
    this.isCheering = true;
    this.cheerTimer = 2.0;
  }

  public triggerFall() {
    this.isFalling = true;
    this.fallTimer = 1.5;
  }

  /**
   * Tick animation each frame
   */
  public update(dt: number) {
    this.animTimer += dt;

    if (this.isFalling) {
      // Topple backward into lava with flailing limbs
      this.group.rotation.x = THREE.MathUtils.damp(this.group.rotation.x, Math.PI / 2, 8, dt);
      this.leftArm.rotation.x = Math.sin(this.animTimer * 20) * 0.8;
      this.rightArm.rotation.x = -Math.sin(this.animTimer * 20) * 0.8;
      this.leftLeg.rotation.x = Math.sin(this.animTimer * 15) * 0.6;
      this.rightLeg.rotation.x = -Math.sin(this.animTimer * 15) * 0.6;
      return;
    }

    if (this.isCheering) {
      // Victory dance: arms up waving!
      this.leftArm.rotation.z = Math.PI - 0.3 + Math.sin(this.animTimer * 8) * 0.3;
      this.rightArm.rotation.z = -Math.PI + 0.3 - Math.sin(this.animTimer * 8) * 0.3;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.torso.position.y = 1.6 + Math.abs(Math.sin(this.animTimer * 6)) * 0.3;
      this.head.position.y = 2.9 + Math.abs(Math.sin(this.animTimer * 6)) * 0.3;
      return;
    }

    if (this.jumpTimer > 0) {
      this.jumpTimer -= dt;
      // Parabolic jump squash & stretch
      const progress = 1 - (this.jumpTimer / 0.45);
      const jumpY = Math.sin(progress * Math.PI) * 1.2;
      this.group.position.y += jumpY * dt * 4;

      // Stretch on ascent, squash on landing
      if (progress < 0.5) {
        this.group.scale.set(0.85, 1.2, 0.85);
      } else {
        this.group.scale.set(1.15, 0.85, 1.15);
      }
      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = -0.8;
      this.leftLeg.rotation.x = 0.4;
      this.rightLeg.rotation.x = -0.4;
    } else {
      // Normal damp back to scale 1
      this.group.scale.x = THREE.MathUtils.damp(this.group.scale.x, 1, 10, dt);
      this.group.scale.y = THREE.MathUtils.damp(this.group.scale.y, 1, 10, dt);
      this.group.scale.z = THREE.MathUtils.damp(this.group.scale.z, 1, 10, dt);

      // Idle breathing / ready bob
      const bob = Math.sin(this.animTimer * 3) * 0.04;
      this.head.position.y = 2.9 + bob;
      this.torso.position.y = 1.6 + bob * 0.5;

      // Idle slight arm sway
      this.leftArm.rotation.x = Math.sin(this.animTimer * 2) * 0.1;
      this.rightArm.rotation.x = -Math.sin(this.animTimer * 2) * 0.1;
      this.leftArm.rotation.z = THREE.MathUtils.damp(this.leftArm.rotation.z, 0.05, 10, dt);
      this.rightArm.rotation.z = THREE.MathUtils.damp(this.rightArm.rotation.z, -0.05, 10, dt);
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z);
  }

  public dispose() {
    // Dispose geometries and materials
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
  }
}
