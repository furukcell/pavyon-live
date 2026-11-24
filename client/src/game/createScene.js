import * as THREE from 'three';
import { getCustomerAppearanceByIndex } from './characterCatalog.js';
import { createWaiterQueue, createWaiterServiceLedger, createWaiterServiceManager, createInteractionReservationManager } from './waiterQueue.js';
import { disposeSceneResources } from './disposeSceneResources.js';
import { cleanupCustomerExit } from './customerExitLifecycle.js';

export function createGame(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1 : 1.5));
  renderer.shadowMap.enabled = window.innerWidth >= 700;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#160d18');
  scene.fog = new THREE.Fog('#160d18', 24, 58);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 22, 25);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight('#ffd9c4', '#291329', 2));
  const key = new THREE.DirectionalLight('#ffe2bd', 2.2);
  key.position.set(-7, 14, 8); key.castShadow = window.innerWidth >= 700; key.shadow.mapSize.set(window.innerWidth < 700 ? 512 : 1024, window.innerWidth < 700 ? 512 : 1024); scene.add(key);
  const redGlow = new THREE.PointLight('#e33368', 35, 22); redGlow.position.set(-6,4,-3); scene.add(redGlow);
  const goldGlow = new THREE.PointLight('#ffc66d', 28, 20); goldGlow.position.set(7,4,2); scene.add(goldGlow);
  const vipLights=[];
  for(const [x,z,color] of [[8.4,-5.8,'#d76a9a'],[11.4,-5.8,'#e8b86d'],[8.4,-1.2,'#e8b86d'],[11.4,-1.2,'#d76a9a']]){
    const light=new THREE.PointLight(color,3.2,5,2);light.position.set(x,2.15,z);scene.add(light);vipLights.push(light);
  }
  const danceWash=new THREE.PointLight('#b34b91',8,10,2);danceWash.position.set(0,3.2,1.5);scene.add(danceWash);
  const stageSpotlights=[];
  const stageWash=[];
  for(let i=0;i<4;i++){
    const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,.28,12),new THREE.MeshStandardMaterial({color:'#d7b16e',metalness:.8,roughness:.25,emissive:'#6b3b28',emissiveIntensity:.35}));
    lamp.position.set(-3+i*2,3.7,-7.6);scene.add(lamp);
    const beam=new THREE.SpotLight(i%2?'#f6c5d2':'#f4d28c',18,18,Math.PI/7,.55,1.2);
    beam.position.set(-3+i*2,3.5,-7.4);beam.target.position.set(-2+i*1.3,.1,-3);scene.add(beam,beam.target);
    const wash=new THREE.Mesh(new THREE.ConeGeometry(1.45,7.8,20,1,true),new THREE.MeshBasicMaterial({color:i%2?'#e6b8d0':'#f1d49c',transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide}));
    wash.position.copy(beam.position);scene.add(wash);stageWash.push(wash);
    stageSpotlights.push({beam,phase:i*Math.PI/2});
  }

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26,22),new THREE.MeshStandardMaterial({color:'#301c2c',roughness:.78}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const border = new THREE.Mesh(new THREE.BoxGeometry(26.3,.35,22.3),new THREE.MeshStandardMaterial({color:'#b17a45',metalness:.65,roughness:.3}));
  border.position.y=-.28;scene.add(border);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshStandardMaterial({color:'#751d3d',roughness:.95}));
  carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.015,1);scene.add(carpet);
  // Subtle geometric floor inlays add depth without creating a dense high-cost tile mesh.
  const floorGold=new THREE.MeshStandardMaterial({color:'#9b7049',metalness:.62,roughness:.38});
  const floorRose=new THREE.MeshStandardMaterial({color:'#54253d',roughness:.72});
  for(let i=0;i<10;i++){
    const line=new THREE.Mesh(new THREE.BoxGeometry(.035,.012,18),floorGold);
    line.position.set(-11.5+i*2.55,.022,0);scene.add(line);
  }
  for(let i=0;i<8;i++){
    const line=new THREE.Mesh(new THREE.BoxGeometry(24,.012,.025),floorRose);
    line.position.set(0,.024,-9.5+i*2.7);scene.add(line);
  }
  const carpetBorder=new THREE.Mesh(new THREE.PlaneGeometry(10.25,7.25),new THREE.MeshStandardMaterial({color:'#c49a5d',roughness:.6}));
  carpetBorder.rotation.x=-Math.PI/2;carpetBorder.position.set(0,.018,1);scene.add(carpetBorder);
  const carpetInset=new THREE.Mesh(new THREE.PlaneGeometry(9.95,6.95),new THREE.MeshStandardMaterial({color:'#751d3d',roughness:.95}));
  carpetInset.rotation.x=-Math.PI/2;carpetInset.position.set(0,.021,1);scene.add(carpetInset);

  function box(name,x,y,z,sx,sy,sz,color,metalness=0){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color,metalness,roughness:.55}));
    mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;
  }
  function label(text,x,z,color='#f2d49c'){
    const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');
    ctx.fillStyle=color;ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.fillText(text,256,62);
    const tex=new THREE.CanvasTexture(c);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
    sprite.position.set(x,1.4,z);sprite.scale.set(4,.75,1);scene.add(sprite);return sprite;
  }
  box('stage',0,.2,-8,8,.4,2.2,'#61213c',.25);
  box('stage-trim',0,.43,-8,8,.12,.12,'#d6a65d',.7);label('SAHNE',0,-8.2);
  // Art-deco proscenium, layered curtains and illuminated stage header.
  box('stage-backdrop',0,1.75,-9.08,7.6,2.55,.16,'#321728',.12);
  box('stage-header',0,3.12,-8.94,7.85,.24,.28,'#bd9256',.78);
  box('stage-header-inset',0,3.12,-8.76,6.9,.1,.06,'#f0cf91',.68);
  // Overhead truss and compact side light bars create a layered stage silhouette.
  box('stage-truss',0,3.72,-7.65,9.4,.12,.14,'#302330',.72);
  for(let i=0;i<9;i++){
    const x=-4+i;
    const mount=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.16,10),new THREE.MeshStandardMaterial({color:'#c69c61',metalness:.82,roughness:.24}));
    mount.position.set(x,3.58,-7.65);scene.add(mount);
    const lens=new THREE.Mesh(new THREE.SphereGeometry(.075,10,8),new THREE.MeshBasicMaterial({color:i%3===0?'#d66b9a':i%3===1?'#f3d29a':'#8e79c5'}));
    lens.position.set(x,3.48,-7.65);scene.add(lens);
  }
  for(const side of [-1,1]){
    const bar=box('stage-side-led-bar',side*4.05,1.55,-7.8,.09,2.35,.1,'#b44b77',.4);
    bar.material.emissive=new THREE.Color('#a12c62');bar.material.emissiveIntensity=.65;bar.castShadow=false;
  }
  for(const side of [-1,1]){
    const curtain=new THREE.Mesh(new THREE.BoxGeometry(.62,2.55,.24),new THREE.MeshStandardMaterial({color:'#7b1e40',roughness:.88}));
    curtain.position.set(side*3.55,1.72,-8.83);curtain.rotation.z=side*-.08;scene.add(curtain);
    const tie=new THREE.Mesh(new THREE.TorusGeometry(.24,.045,6,16),new THREE.MeshStandardMaterial({color:'#d6a65d',metalness:.72,roughness:.28}));
    tie.position.set(side*3.5,1.2,-8.65);scene.add(tie);
    for(let j=0;j<3;j++){const pleat=box('stage-curtain-pleat',side*(3.1+j*.18),1.72,-8.68,.035,2.25,.025,'#a53a5c',.08);pleat.castShadow=false;}
  }
  for(let i=0;i<17;i++){
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:i%2?'#f4c5d4':'#ffe0a0'}));
    bulb.position.set(-3.65+i*.456,3.12,-8.57);scene.add(bulb);
  }
  for(let i=0;i<5;i++){
    const panel=box('stage-led-panel',0,1.35,-8.7,.72,1.15,.055,i%2?'#53243d':'#38233e',.2);
    panel.position.x=-2+i;panel.castShadow=false;
    const inset=box('stage-led-inset',-2+i,1.35,-8.66,.58,.94,.018,i%2?'#a63b68':'#6e426d',.18);inset.castShadow=false;
  }
  box('bar',-10,.65,-5,2.2,1.3,5,'#5a2b3c');label('SERVİS',-10,-5);
  box('bar-countertop',-10,1.34,-5,2.48,.16,5.2,'#3a2430',.48);
  box('bar-front-gold',-10,.82,-2.47,2.25,.08,.045,'#c49a5d',.78);
  for(let i=0;i<5;i++){
    const panel=box('bar-front-panel',-10.82+i*.41,.78,-2.445,.28,.66,.035,i%2?'#4b263b':'#382033',.2);
    panel.castShadow=false;
  }
  for(let i=0;i<4;i++){
    const stoolX=-11.05+i*.7;
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,.55,10),new THREE.MeshStandardMaterial({color:'#b58a54',metalness:.72,roughness:.3}));
    stem.position.set(stoolX,.31,-1.72);scene.add(stem);
    const seat=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.13,16),new THREE.MeshStandardMaterial({color:'#6b2945',roughness:.72}));
    seat.position.set(stoolX,.62,-1.72);scene.add(seat);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.045,16),new THREE.MeshStandardMaterial({color:'#b58a54',metalness:.7}));
    foot.position.set(stoolX,.055,-1.72);scene.add(foot);
  }
  box('vip-wall',9,.6,-7,.25,1.2,5,'#bc8d50',.7);
  box('vip-floor',8,.05,-4,5,.1,5,'#48233b');label('VIP LOCA',8,-4);
  label('DANS PİSTİ',0,1,'#f4d4a5');
  // Stage-side speaker stacks and low LED strips give the performance area a stronger focal point.
  for(const side of [-1,1]){
    const sx=side*4.35;
    box('stage-speaker',sx,.95,-7.65,.72,1.5,.8,'#21151f',.35);
    for(const y of [.55,1.08]){
      const woofer=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.055,20),new THREE.MeshStandardMaterial({color:'#08070b',metalness:.25,roughness:.5}));
      woofer.rotation.x=Math.PI/2;woofer.position.set(sx,y,-7.22);scene.add(woofer);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.205,.025,6,20),new THREE.MeshStandardMaterial({color:'#c59a5c',metalness:.8,roughness:.25}));
      rim.position.set(sx,y,-7.18);scene.add(rim);
    }
  }
  for(let i=0;i<12;i++){
    const led=new THREE.Mesh(new THREE.BoxGeometry(.48,.035,.055),new THREE.MeshBasicMaterial({color:i%2?'#d64b79':'#e5b761'}));
    led.position.set(-3.3+i*.6,.46,-6.82);scene.add(led);
  }
  // Back-bar bottle silhouettes.
  for(let i=0;i<7;i++){
    const bx=-10.72+(i%4)*.48, bz=-6.45+Math.floor(i/4)*.62;
    const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.085,.11,.42,10),new THREE.MeshStandardMaterial({color:['#47745d','#9b573e','#a98a42'][i%3],roughness:.3,metalness:.18}));
    bottle.position.set(bx,1.42,bz);scene.add(bottle);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.15,8),new THREE.MeshStandardMaterial({color:'#c9a66c',metalness:.45,roughness:.3}));
    neck.position.set(bx,1.7,bz);scene.add(neck);
  }

  const tablePositions=[[-7,3],[-3,6],[4,6],[8,2],[-8,-1],[4,-1]];
  const tableStates=tablePositions.map((position,index)=>({id:index+1,x:position[0],z:position[1],seats:[],occupied:0}));
  const seatSpots=[];
  tablePositions.forEach(([x,z],i)=>{
    const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.16,.27,.78,16),new THREE.MeshStandardMaterial({color:'#3a2630',metalness:.48,roughness:.34}));
    pedestal.position.set(x,.48,z);pedestal.castShadow=true;scene.add(pedestal);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.08,20),new THREE.MeshStandardMaterial({color:'#b88b50',metalness:.72,roughness:.3}));
    foot.position.set(x,.09,z);scene.add(foot);
    const table=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.18,32),new THREE.MeshStandardMaterial({color:'#6e3d36',metalness:.35,roughness:.35}));
    table.position.set(x,.9,z);table.castShadow=true;scene.add(table);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(.83,.83,.06,32),new THREE.MeshStandardMaterial({color:'#d0a260',metalness:.72,roughness:.28}));
    top.position.set(x,1.02,z);scene.add(top);
    const inlay=new THREE.Mesh(new THREE.TorusGeometry(.64,.018,6,40),new THREE.MeshStandardMaterial({color:'#f0d29b',metalness:.82,roughness:.2}));
    inlay.rotation.x=Math.PI/2;inlay.position.set(x,1.055,z);scene.add(inlay);
    for(let j=0;j<3;j++){
      const a=j*Math.PI*2/3,sx=x+Math.cos(a)*1.45,sz=z+Math.sin(a)*1.45;
      const seatGroup=new THREE.Group();seatGroup.position.set(sx,.02,sz);seatGroup.rotation.y=-a;scene.add(seatGroup);
      const seatMaterial=new THREE.MeshStandardMaterial({color:'#8c2545',roughness:.78});
      const cushion=new THREE.Mesh(new THREE.BoxGeometry(.82,.16,.68),seatMaterial);
      cushion.position.y=.39;cushion.castShadow=true;seatGroup.add(cushion);
      const back=new THREE.Mesh(new THREE.BoxGeometry(.82,.62,.14),seatMaterial);
      back.position.set(0,.72,-.25);back.castShadow=true;seatGroup.add(back);
      for(const legX of [-.31,.31])for(const legZ of [-.23,.23]){
        const chairLeg=new THREE.Mesh(new THREE.BoxGeometry(.055,.35,.055),new THREE.MeshStandardMaterial({color:'#b58a54',metalness:.68,roughness:.32}));
        chairLeg.position.set(legX,.18,legZ);seatGroup.add(chairLeg);
      }
      const spot={x:sx,z:sz,rotation:-a,occupied:false,tableId:i+1,mesh:cushion};
      seatSpots.push(spot);tableStates[i].seats.push(spot);
    }
    // Warm candlelight and glassware add detail to each guest table.
    const candle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.065,.22,10),new THREE.MeshStandardMaterial({color:'#f0d8ad',roughness:.45}));
    candle.position.set(x,.14,z);scene.add(candle);
    const flame=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:'#ffbd65'}));
    flame.position.set(x,.29,z);scene.add(flame);
    const candleLight=new THREE.PointLight('#ffb96a',1.1,2.8);candleLight.position.set(x,.48,z);scene.add(candleLight);
    for(const side of [-1,1]){
      const glass=new THREE.Mesh(new THREE.CylinderGeometry(.075,.06,.2,12,1,true),new THREE.MeshPhysicalMaterial({color:'#b8dce8',transparent:true,opacity:.42,roughness:.12,metalness:.05,side:THREE.DoubleSide}));
      glass.position.set(x+side*.32,.14,z+.16);scene.add(glass);
      const drink=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.07,10),new THREE.MeshStandardMaterial({color:side===-1?'#8f263f':'#b87838',roughness:.25}));
      drink.position.set(x+side*.32,.055,z+.16);scene.add(drink);
    }
    label('MASA '+(i+1),x,z+1.8,'#e8c78e');
  });
  for(let i=0;i<7;i++){const post=box('gold-post',-11+i*3.65,2,-10.5,.09,4,.09,'#b9864c',.8);post.castShadow=false;}
  // A layered rear feature wall frames the stage and gives the room a finished architectural edge.
  box('rear-wall',0,2.05,-10.92,25.8,4.1,.28,'#241522',.12);
  for(let i=0;i<9;i++){
    const x=-10.4+i*2.6;
    box('wall-inset',x,2.05,-10.73,1.82,2.75,.045,i%2?'#392033':'#321b2d',.18);
    box('wall-inset-top',x,3.48,-10.68,1.84,.055,.07,'#bd9256',.72);
    box('wall-inset-bottom',x,.68,-10.68,1.84,.045,.07,'#8e5d49',.55);
  }
  for(const x of [-11.4,-8.2,8.2,11.4]){
    const sconce=box('wall-sconce',x,2.45,-10.48,.18,.5,.12,'#d8b16f',.7);
    sconce.castShadow=false;
    const glow=new THREE.PointLight('#f3bd80',1.25,4);glow.position.set(x,2.55,-10.05);scene.add(glow);
  }
  // Upholstered VIP benches stay along the perimeter, leaving the reserved guest positions clear.
  const vipFabric=new THREE.MeshStandardMaterial({color:'#63243f',roughness:.82});
  const vipGold=new THREE.MeshStandardMaterial({color:'#c49a5d',metalness:.72,roughness:.28});
  for(const z of [-6.15,-1.65]){
    const base=new THREE.Mesh(new THREE.BoxGeometry(2.35,.42,.72),vipFabric);
    base.position.set(10.15,.35,z);base.castShadow=true;scene.add(base);
    const back=new THREE.Mesh(new THREE.BoxGeometry(2.35,.92,.2),vipFabric);
    back.position.set(10.15,.92,z-.26);back.castShadow=true;scene.add(back);
    for(const x of [9.12,11.18]){
      const arm=new THREE.Mesh(new THREE.BoxGeometry(.22,.62,.76),vipFabric);
      arm.position.set(x,.57,z);arm.castShadow=true;scene.add(arm);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.23,.045,.78),vipGold);
      cap.position.set(x,.89,z);scene.add(cap);
    }
    const piping=new THREE.Mesh(new THREE.BoxGeometry(2.22,.035,.025),vipGold);
    piping.position.set(10.15,1.32,z-.15);scene.add(piping);
  }
  for(const x of [8.95,11.35]){
    const sideTable=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,.12,16),vipGold);
    sideTable.position.set(x,.68,-3.9);scene.add(sideTable);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.62,10),vipGold);
    stem.position.set(x,.36,-3.9);scene.add(stem);
  }

  // Main guest entrance: a framed doorway and warm threshold lighting.
  box('entry-portal-frame',0,1.85,10.55,4.1,3.7,.28,'#33202f',.35);
  box('entry-portal-opening',0,1.65,10.36,2.75,3.15,.16,'#100b13',.08);
  box('entry-portal-header',0,3.72,10.35,4.35,.22,.42,'#c49a5d',.78);
  for(const side of [-1,1]){
    box('entry-portal-column',side*1.82,1.8,10.34,.22,3.55,.3,'#b58a54',.72);
    box('entry-portal-base',side*1.82,.22,10.34,.48,.3,.52,'#5a2b3c',.32);
    const sconce=new THREE.PointLight('#e9b978',2.2,4);sconce.position.set(side*1.6,2.65,9.95);scene.add(sconce);
  }
  box('entry-threshold',0,.045,9.95,3.1,.07,.9,'#a77a4c',.58);
  const actorGroup=new THREE.Group();scene.add(actorGroup);
  const actors=new Map();
  let customerSequence=0;
  // Each browser owns its camera state; selecting an actor never changes another viewer's view.
  const cameraFocus=new THREE.Vector3(0,0,0);
  let followedActor=null;
  let cameraYaw=0;
  let cameraPitch=.72;
  let cameraDistance=30;
  let cameraDragging=false;
  let cameraPointer=null;
  const cameraRaycaster=new THREE.Raycaster();
  const cameraPointerNdc=new THREE.Vector2();
  function setCameraFollow(actor){
    followedActor=actor||null;
    if(followedActor){
      cameraDistance=8.5;
      cameraPitch=.48;
      cameraYaw=followedActor.rotation.y;
      document.querySelector('#camera-mode')?.setAttribute('aria-pressed','true');
      const button=document.querySelector('#camera-mode');if(button)button.textContent='◉ KARAKTER TAKİPTE';
    }else{
      cameraDistance=window.innerWidth<700?31:27;
      cameraPitch=.72;cameraYaw=0;
      document.querySelector('#camera-mode')?.setAttribute('aria-pressed','false');
      const button=document.querySelector('#camera-mode');if(button)button.textContent='◎ GENEL KAMERA';
    }
  }
  function selectActorAt(clientX,clientY){
    const rect=canvas.getBoundingClientRect();
    cameraPointerNdc.set(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);
    cameraRaycaster.setFromCamera(cameraPointerNdc,camera);
    const hits=cameraRaycaster.intersectObjects(actorGroup.children,true);
    let actor=null;
    for(const hit of hits){
      let node=hit.object;
      while(node&&node!==actorGroup&&!node.userData.cameraPickTarget)node=node.parent;
      if(node?.userData.cameraPickTarget){actor=node.userData.cameraPickTarget;break;}
      if(node&&node.parent===actorGroup){actor=node;break;}
    }
    setCameraFollow(actor);
  }
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    cameraDragging=true;cameraPointer={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!cameraDragging||!cameraPointer)return;
    const dx=event.clientX-cameraPointer.lastX,dy=event.clientY-cameraPointer.lastY;
    if(Math.hypot(event.clientX-cameraPointer.x,event.clientY-cameraPointer.y)>4)cameraPointer.moved=true;
    if(cameraPointer.moved){
      cameraYaw-=dx*.006;
      cameraPitch=THREE.MathUtils.clamp(cameraPitch+dy*.004,-.15,1.12);
    }
    cameraPointer.lastX=event.clientX;cameraPointer.lastY=event.clientY;
  });
  const finishCameraPointer=event=>{
    if(!cameraDragging||!cameraPointer)return;
    if(!cameraPointer.moved)selectActorAt(event.clientX,event.clientY);
    cameraDragging=false;cameraPointer=null;
  };
  canvas.addEventListener('pointerup',finishCameraPointer);
  canvas.addEventListener('pointercancel',()=>{cameraDragging=false;cameraPointer=null;});
  canvas.addEventListener('wheel',event=>{
    event.preventDefault();
    cameraDistance=THREE.MathUtils.clamp(cameraDistance+Math.sign(event.deltaY)*.8,followedActor?5.5:16,followedActor?16:42);
  },{passive:false});
  function updateCamera(dt){
    if(followedActor&&!actors.has(followedActor.userData.id)){setCameraFollow(null);}
    const desiredFocus=followedActor
      ? new THREE.Vector3(followedActor.position.x,1.05,followedActor.position.z)
      : new THREE.Vector3(0,0,0);
    cameraFocus.lerp(desiredFocus,Math.min(1,dt*(followedActor?7:3)));
    const horizontal=Math.cos(cameraPitch)*cameraDistance;
    const desiredPosition=new THREE.Vector3(
      cameraFocus.x+Math.sin(cameraYaw)*horizontal,
      cameraFocus.y+Math.sin(cameraPitch)*cameraDistance,
      cameraFocus.z+Math.cos(cameraYaw)*horizontal
    );
    camera.position.lerp(desiredPosition,Math.min(1,dt*6));
    camera.lookAt(cameraFocus);
  }
  const konsHomes=new Map();
  const waiterHomes=new Map();
  const waiterQueue=createWaiterQueue(30);
  const activeCustomerServices=createWaiterServiceLedger();
  const vipSlots=[{x:7,z:-5},{x:8.5,z:-5},{x:7,z:-2.8},{x:8.5,z:-2.8}];
  const danceSlots=[{x:-3,z:1},{x:0,z:1},{x:3,z:1},{x:-3,z:3},{x:0,z:3},{x:3,z:3}];
  const interactionReservations=createInteractionReservationManager({danceSlots,vipSlots});
  const konsColors=['#a92f59','#692b62','#bd7544','#345e77','#8d3b45','#75539a','#b08a36','#3f786a','#934c70','#5c4a37'];
  const skinTones=['#e8bd9b','#d6a17e','#b97855','#f0c9a8','#986447','#c88d6d'];
  const hairTones=['#211b22','#38251e','#6c4930','#171820','#7b5a3c'];
  const colors=['#4b9a8c','#c28b48','#5572a8','#a84e6b','#77914d','#8967a6','#cf7950'];
  function makeActor(id,role='customer',variant=0){
    const group=new THREE.Group();
    // After the room fills, distant audience members use a lighter model to protect frame time.
    const liteCustomer=role==='customer'&&actors.size>=30;
    const appearance=getCustomerAppearanceByIndex(role==='kons'?variant*2+1:variant);
    group.userData={id,role,target:null,phase:Math.random()*6,gaitPhase:Math.random()*Math.PI*2,motion:'idle',flirtPhase:Math.random()*Math.PI*2,liteCustomer};
    const generatedColor=role==='customer'?appearance.outfit:new THREE.Color().setHSL((variant*0.137)%1,.34,.43);
    const color=role==='kons'?konsColors[variant%konsColors.length]:role==='waiter'?'#e7dfd3':generatedColor;
    const bodyGeometry=role==='kons'
      ? new THREE.CapsuleGeometry(.235,.58,liteCustomer?4:6,liteCustomer?8:16)
      : new THREE.LatheGeometry([
          new THREE.Vector2(.17,-.39),new THREE.Vector2(.185,-.29),
          new THREE.Vector2(.205,-.12),new THREE.Vector2(.18,.04),
          new THREE.Vector2(.205,.19),new THREE.Vector2(.265,.34),
          new THREE.Vector2(.245,.39)
        ],liteCustomer?10:24);
    const body=new THREE.Mesh(bodyGeometry,new THREE.MeshStandardMaterial({color,roughness:role==='kons'?.34:.72,metalness:role==='kons'?.16:0}));
    body.position.y=role==='kons'?.72:.78;
    body.scale.set(role==='kons'?.92:1,role==='kons'?1:1.04,role==='kons'?.88:1);
    body.castShadow=!liteCustomer;body.receiveShadow=!liteCustomer;group.add(body);
    group.userData.body=body;
    if(role==='customer'&&!liteCustomer){
      // Layered street/evening wear so customers read as dressed people, not colored mannequins.
      const female=appearance.gender==='female';
      const jacketPalette=['#252832','#40313a','#26343a','#49372e','#343044','#5a3438'];
      const jacketColor=jacketPalette[(variant*7)%jacketPalette.length];
      const trimColor=variant%2?'#d3b27a':'#c5c5c8';
      if(variant%4!==2){
        const jacketMaterial=new THREE.MeshStandardMaterial({color:jacketColor,roughness:.78});
        const shirtMaterial=new THREE.MeshStandardMaterial({color:female?(variant%2?'#eee0d7':'#e5c9cb'):'#e8e3dc',roughness:.7});
        const shirtFront=new THREE.Mesh(new THREE.BoxGeometry(.19,.34,.035),shirtMaterial);
        shirtFront.position.set(0,.79,.224);group.add(shirtFront);
        for(const side of [-1,1]){
          const panel=new THREE.Mesh(new THREE.BoxGeometry(.115,.39,.045),jacketMaterial);
          panel.position.set(side*.125,.77,.22);panel.rotation.z=side*.035;group.add(panel);
          const lapel=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:jacketColor,roughness:.76,side:THREE.DoubleSide}));
          const points=[new THREE.Vector3(side*.035,.98,.253),new THREE.Vector3(side*.14,1.02,.25),new THREE.Vector3(side*.105,.82,.258)];
          lapel.geometry.setFromPoints(points);lapel.geometry.computeVertexNormals();group.add(lapel);
        }
        const seam=new THREE.Mesh(new THREE.BoxGeometry(.012,.3,.012),new THREE.MeshStandardMaterial({color:trimColor,metalness:.2,roughness:.55}));
        seam.position.set(0,.78,.257);group.add(seam);
        if(!female&&variant%3===0){
          const tie=new THREE.Mesh(new THREE.ConeGeometry(.035,.23,4),new THREE.MeshStandardMaterial({color:variant%2?'#7b293c':'#263c58',roughness:.5}));
          tie.position.set(0,.81,.263);tie.rotation.x=Math.PI;group.add(tie);
        }
        for(let button=0;button<3;button++){
          const stud=new THREE.Mesh(new THREE.SphereGeometry(.012,7,6),new THREE.MeshStandardMaterial({color:trimColor,metalness:.45,roughness:.35}));
          stud.position.set((variant%2===0?-.09:.09),.9-button*.085,.265);group.add(stud);
        }
      }else{
        const knit=new THREE.Mesh(new THREE.CylinderGeometry(.235,.245,.12,20,1,true),new THREE.MeshStandardMaterial({color:jacketColor,roughness:.88,side:THREE.DoubleSide}));
        knit.position.y=.59;group.add(knit);
      }
      if(female&&variant%3===1){
        const pendant=new THREE.Mesh(new THREE.SphereGeometry(.025,10,8),new THREE.MeshStandardMaterial({color:'#d8b36f',metalness:.8,roughness:.25}));
        pendant.position.set(0,1.015,.265);group.add(pendant);
      }
    }
    if(role!=='kons'&&!liteCustomer){
      const waistSeam=new THREE.Mesh(new THREE.TorusGeometry(role==='waiter'?.205:.22,.012,6,24),new THREE.MeshStandardMaterial({color:role==='waiter'?'#b58a54':'#4b3b3e',metalness:.28,roughness:.48}));
      waistSeam.rotation.x=Math.PI/2;waistSeam.position.y=.54;group.add(waistSeam);
    }
    const skin=role==='waiter'?'#d6ad8c':appearance.skin;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.22+(variant%3)*.012,liteCustomer?12:28,liteCustomer?10:20),new THREE.MeshStandardMaterial({color:skin,roughness:.72}));
    head.position.y=1.35;head.scale.set(.91,1.08,.9);head.castShadow=!liteCustomer;group.add(head);
    group.userData.head=head;
    if(!liteCustomer&&role!=='kons'){
      // Facial planes and features sized for a human silhouette (front is +Z).
      const faceMat=new THREE.MeshStandardMaterial({color:skin,roughness:.84});
      for(const side of [-1,1]){
        const ear=new THREE.Mesh(new THREE.SphereGeometry(.052,10,8),faceMat);
        ear.scale.set(.48,1.12,.58);ear.position.set(side*.205,1.345,0);group.add(ear);
        const earInset=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshStandardMaterial({color:skin.clone?skin:'#9c7466',roughness:.9}));
        earInset.scale.set(.6,1,.45);earInset.position.set(side*.222,1.345,.025);group.add(earInset);
        const browRidge=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.065,3,7),new THREE.MeshStandardMaterial({color:role==='waiter'?'#28212a':appearance.hair,roughness:.86}));
        browRidge.position.set(side*.073,1.408,.195);browRidge.rotation.z=side*.08;group.add(browRidge);
      }
      const noseBridge=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.07,3,7),faceMat);
      noseBridge.position.set(0,1.335,.202);group.add(noseBridge);
      const chin=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),faceMat);
      chin.scale.set(1,.48,.55);chin.position.set(0,1.235,.12);group.add(chin);
      const lip=new THREE.Mesh(new THREE.SphereGeometry(.035,10,7),new THREE.MeshStandardMaterial({color:'#87545a',roughness:.78}));
      lip.scale.set(1,.2,.38);lip.position.set(0,1.258,.211);group.add(lip);
    }
    if(role!=='kons'&&!liteCustomer){
      const eyeMaterial=new THREE.MeshStandardMaterial({color:'#251b20',roughness:.42});
      const eyeWhite=new THREE.MeshStandardMaterial({color:'#eee5dc',roughness:.55});
      for(const side of [-1,1]){
        const socket=new THREE.Mesh(new THREE.SphereGeometry(.026,10,8),eyeWhite);
        socket.scale.set(1.18,.72,.42);socket.position.set(side*.073,1.365,.194);group.add(socket);
        const pupil=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),eyeMaterial);
        pupil.position.set(side*.073,1.365,.215);group.add(pupil);
        const brow=new THREE.Mesh(new THREE.CapsuleGeometry(.008,.052,3,6),new THREE.MeshStandardMaterial({color:(role==='waiter'?'#28212a':appearance.hair),roughness:.8}));
        brow.position.set(side*.073,1.405,.19);brow.rotation.z=side*.12;group.add(brow);
      }
      const nose=new THREE.Mesh(new THREE.SphereGeometry(.025,9,7),new THREE.MeshStandardMaterial({color:skin,roughness:.85}));
      nose.scale.set(.8,.8,.7);nose.position.set(0,1.315,.215);group.add(nose);
      const mouth=new THREE.Mesh(new THREE.SphereGeometry(.032,10,7),new THREE.MeshStandardMaterial({color:'#74434a',roughness:.7}));
      mouth.scale.set(1,.16,.3);mouth.position.set(0,1.265,.202);group.add(mouth);
      group.userData.mouth=mouth;
    }
    if(role==='kons'){
      const earMaterial=new THREE.MeshStandardMaterial({color:skin,roughness:.78});
      for(const side of [-1,1]){
        const ear=new THREE.Mesh(new THREE.SphereGeometry(.052,14,10),earMaterial);
        ear.scale.set(.58,1.12,.58);ear.position.set(side*.205,1.335,.005);group.add(ear);
        const cheekbone=new THREE.Mesh(new THREE.SphereGeometry(.072,14,10),new THREE.MeshStandardMaterial({color:skin,roughness:.82}));
        cheekbone.scale.set(1.1,.62,.48);cheekbone.position.set(side*.115,1.285,.164);group.add(cheekbone);
      }
    }
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.18,10),new THREE.MeshStandardMaterial({color:skin,roughness:.85}));
    neck.position.y=1.12;group.add(neck);
    const hairColor=role==='waiter'?'#28212a':appearance.hair;
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.23+(variant%5)*.008,liteCustomer?12:24,liteCustomer?8:16,0,Math.PI*2,0,Math.PI*(.48+(variant%4)*.08)),new THREE.MeshStandardMaterial({color:hairColor,roughness:.34,metalness:.04}));
    hair.position.set(0,1.42,0);hair.castShadow=!liteCustomer;group.add(hair);
    if(role==='kons'){
      for(const side of [-1,1]){
        const lock=new THREE.Mesh(new THREE.CapsuleGeometry(.045,.22,5,10),new THREE.MeshStandardMaterial({color:hairColor,roughness:.36}));
        lock.name=`kons-hair-lock-${side}`;lock.position.set(side*.19,1.27,.025);lock.rotation.z=side*.12;group.add(lock);
      }
    }
    if(role==='kons'){
      const strandMaterial=new THREE.MeshStandardMaterial({color:hairColor,roughness:.32,metalness:.035});
      for(let strand=0;strand<5;strand++){
        const side=strand%2===0?-1:1;
        const x=side*(.13+(strand%3)*.035);
        const wave=new THREE.CatmullRomCurve3([
          new THREE.Vector3(x,1.48,.045),
          new THREE.Vector3(x+side*.025,1.34,.085),
          new THREE.Vector3(x-side*.012,1.19,.06),
          new THREE.Vector3(x+side*.018,1.05,.015)
        ]);
        const strandMesh=new THREE.Mesh(new THREE.TubeGeometry(wave,12,.018+(strand%2)*.006,6,false),strandMaterial);
        strandMesh.name=`kons-hair-strand-${strand}`;strandMesh.castShadow=true;group.add(strandMesh);
      }
    }
    if(role!=='kons'&&!liteCustomer){
      const hairSideMaterial=new THREE.MeshStandardMaterial({color:hairColor,roughness:.4});
      for(const side of [-1,1]){
        const sideburn=new THREE.Mesh(new THREE.CapsuleGeometry(.035,.12,4,8),hairSideMaterial);
        sideburn.position.set(side*.19,1.27,.015);sideburn.rotation.z=side*.08;group.add(sideburn);
      }
      if(role==='customer'&&variant%3===0){
        const fringe=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),hairSideMaterial);
        fringe.scale.set(1,.38,.65);fringe.position.set(0,1.47,.14);group.add(fringe);
      }
    }
    if(role==='kons'&&['long','wavy','curly','ponytail'].includes(appearance.haircut)){
      const backHair=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshStandardMaterial({color:hairColor}));
      backHair.scale.set(.9,1.75,.78);backHair.position.set(0,1.02,-.12);group.add(backHair);
    }
    if(role==='kons'&&appearance.haircut==='ponytail'){
      const ponytail=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.38,4,7),new THREE.MeshStandardMaterial({color:hairColor}));
      ponytail.name='kons-ponytail';ponytail.position.set(0,1.12,-.27);ponytail.rotation.x=-.25;group.add(ponytail);
    }
    if(role==='kons'&&appearance.haircut==='bob'){
      for(const side of [-1,1]){
        const bobSide=new THREE.Mesh(new THREE.SphereGeometry(.105,8,7),new THREE.MeshStandardMaterial({color:hairColor}));
        bobSide.scale.set(.75,1.5,.8);bobSide.position.set(side*.18,1.25,.005);group.add(bobSide);
      }
    }
    if(liteCustomer){
      const limbMaterial=new THREE.MeshStandardMaterial({color:skin,roughness:.82});
      const armPivots=[];
      const legPivots=[];
      for(const side of [-1,1]){
        const armPivot=new THREE.Group();
        armPivot.position.set(side*.27,1.02,0);
        const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.058,.3,3,6),limbMaterial);
        arm.position.y=-.22;armPivot.add(arm);group.add(armPivot);armPivots.push(armPivot);
        const legPivot=new THREE.Group();
        legPivot.position.set(side*.13,.38,0);
        const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.34,3,6),limbMaterial);
        leg.position.y=-.22;legPivot.add(leg);group.add(legPivot);legPivots.push(legPivot);
      }
      group.userData.armPivots=armPivots;
      group.userData.legPivots=legPivots;
    }else if(role==='kons'||role==='customer'||role==='waiter'||role==='musician'){
      const limbMaterial=new THREE.MeshStandardMaterial({color:skin,roughness:.82});
      const armPivots=[];
      const legPivots=[];
      for(const side of [-1,1]){
        const armPivot=new THREE.Group();
        armPivot.position.set(side*(role==='kons'?.29:.27),1.02,0);
        const upperArm=new THREE.Mesh(new THREE.CapsuleGeometry(.066,.19,5,10),limbMaterial);
        upperArm.position.y=-.145;upperArm.castShadow=true;armPivot.add(upperArm);
        const elbow=new THREE.Mesh(new THREE.SphereGeometry(.061,10,8),limbMaterial);
        elbow.position.y=-.285;armPivot.add(elbow);
        const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.052,.17,5,10),limbMaterial);
        forearm.position.set(0,-.365,.006);forearm.castShadow=true;armPivot.add(forearm);
        const hand=new THREE.Mesh(new THREE.SphereGeometry(.057,12,9),limbMaterial);
        hand.scale.set(.82,1.12,.72);hand.position.set(0,-.49,.012);armPivot.add(hand);
        for(let finger=0;finger<3;finger++){
          const digit=new THREE.Mesh(new THREE.CapsuleGeometry(.012,.045,3,6),limbMaterial);
          digit.position.set((finger-1)*.025,-.545,.025);digit.rotation.z=(finger-1)*-.12;armPivot.add(digit);
        }
        if(role==='waiter'&&side===1){
          const tray=new THREE.Group();
          const plate=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.025,16),new THREE.MeshStandardMaterial({color:'#c9cbd0',metalness:.72,roughness:.24}));
          plate.position.set(0,-.34,.08);tray.add(plate);
          const glass=new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.18,10),new THREE.MeshStandardMaterial({color:'#b9dce8',transparent:true,opacity:.7,roughness:.12}));
          glass.position.set(.04,-.23,.08);tray.add(glass);
          armPivot.add(tray);group.userData.tray=tray;
        }
        group.add(armPivot);armPivots.push(armPivot);
        const legPivot=new THREE.Group();
        legPivot.position.set(side*.13,.38,0);
        const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.078,.2,5,10),limbMaterial);
        thigh.position.y=-.12;thigh.castShadow=true;legPivot.add(thigh);
        const knee=new THREE.Mesh(new THREE.SphereGeometry(.071,10,8),limbMaterial);
        knee.position.y=-.255;legPivot.add(knee);
        const shin=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.19,5,10),limbMaterial);
        shin.position.set(0,-.36,.012);shin.castShadow=true;legPivot.add(shin);
        if(role!=='kons'){
          const trouserColor=role==='waiter'?(variant%2?'#28212b':'#202b35'):variant%4===0?'#24232b':variant%4===1?'#34303a':variant%4===2?'#292c32':'#3b3030';
          const trouserMaterial=new THREE.MeshStandardMaterial({color:trouserColor,roughness:.82});
          const thighCloth=new THREE.Mesh(new THREE.CapsuleGeometry(.087,.205,5,10),trouserMaterial);
          thighCloth.position.y=-.12;legPivot.add(thighCloth);
          const shinCloth=new THREE.Mesh(new THREE.CapsuleGeometry(.064,.19,5,10),trouserMaterial);
          shinCloth.position.set(0,-.36,.012);legPivot.add(shinCloth);
        }
        const foot=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:role==='kons'?'#241522':role==='waiter'?'#211b20':'#30252a',roughness:.48,metalness:role==='kons'?.18:0}));
        foot.scale.set(.085,.052,.155);foot.position.set(0,-.48,.075);legPivot.add(foot);
        if(role!=='kons'){
          const shoeColor=role==='waiter'?'#17151a':variant%3===0?'#20191b':variant%3===1?'#35272a':'#242a31';
          const shoe=new THREE.Mesh(new THREE.BoxGeometry(.16,.085,.25),new THREE.MeshStandardMaterial({color:shoeColor,roughness:.48,metalness:.08}));
          shoe.position.set(0,-.475,.105);shoe.rotation.x=-.04;legPivot.add(shoe);
          const sole=new THREE.Mesh(new THREE.BoxGeometry(.165,.018,.255),new THREE.MeshStandardMaterial({color:'#100f12',roughness:.7}));
          sole.position.set(0,-.515,.105);legPivot.add(sole);
        }
        group.add(legPivot);legPivots.push(legPivot);
      }
      group.userData.armPivots=armPivots;
      group.userData.legPivots=legPivots;
    }
    if(role==='musician'){
      const jacket=new THREE.Mesh(new THREE.BoxGeometry(.39,.48,.055),new THREE.MeshStandardMaterial({color:'#211b25',roughness:.48}));
      jacket.position.set(0,.75,.22);group.add(jacket);
      const shirt=new THREE.Mesh(new THREE.BoxGeometry(.13,.4,.025),new THREE.MeshStandardMaterial({color:'#e7dfd3',roughness:.65}));
      shirt.position.set(0,.77,.255);group.add(shirt);
      const chain=new THREE.Mesh(new THREE.TorusGeometry(.09,.009,6,20),new THREE.MeshStandardMaterial({color:'#cba15d',metalness:.72,roughness:.3}));
      chain.position.set(0,.99,.27);chain.rotation.x=Math.PI/2;group.add(chain);
      const lapelMaterial=new THREE.MeshStandardMaterial({color:'#382d38',roughness:.42});
      for(const side of [-1,1]){
        const lapel=new THREE.Mesh(new THREE.BoxGeometry(.075,.25,.025),lapelMaterial);
        lapel.position.set(side*.105,.94,.265);lapel.rotation.z=side*.22;group.add(lapel);
      }
      const bowTie=new THREE.Mesh(new THREE.BoxGeometry(.16,.055,.035),new THREE.MeshStandardMaterial({color:'#c49a58',metalness:.35,roughness:.35}));
      bowTie.position.set(0,1.055,.275);group.add(bowTie);
      for(let button=0;button<3;button++){
        const stud=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshStandardMaterial({color:'#d9bd83',metalness:.72,roughness:.25}));
        stud.position.set(0,.84-button*.105,.27);group.add(stud);
      }
    }
    if(role==='waiter'||role==='musician'){
      const uniformColor=role==='waiter'?(variant%2?'#382433':'#26323d'):'#211b25';
      const shoulderMat=new THREE.MeshStandardMaterial({color:uniformColor,roughness:.72});
      for(const side of [-1,1]){
        const shoulder=new THREE.Mesh(new THREE.SphereGeometry(.115,10,8),shoulderMat);
        shoulder.scale.set(1,.78,.92);shoulder.position.set(side*.235,.96,.015);group.add(shoulder);
        const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.065,.17,4,8),shoulderMat);
        sleeve.position.set(side*.27,.83,0);sleeve.rotation.z=side*.12;group.add(sleeve);
      }
      const collarMat=new THREE.MeshStandardMaterial({color:'#f2ece2',roughness:.78});
      for(const side of [-1,1]){
        const collarPoint=new THREE.Mesh(new THREE.ConeGeometry(.045,.13,4),collarMat);
        collarPoint.position.set(side*.055,1.015,.24);collarPoint.rotation.z=side*Math.PI;group.add(collarPoint);
      }
    }
    if(role==='waiter'){
      const shirtFront=new THREE.Mesh(new THREE.BoxGeometry(.19,.46,.025),new THREE.MeshStandardMaterial({color:'#f5eee2',roughness:.7}));
      shirtFront.position.set(0,.76,.238);group.add(shirtFront);
      const vestMaterial=new THREE.MeshStandardMaterial({color:variant%2?'#382433':'#26323d',roughness:.62});
      for(const side of [-1,1]){
        const vestPanel=new THREE.Mesh(new THREE.BoxGeometry(.105,.43,.035),vestMaterial);
        vestPanel.position.set(side*.115,.75,.226);vestPanel.rotation.z=side*.045;group.add(vestPanel);
      }
      const bow=new THREE.Mesh(new THREE.BoxGeometry(.13,.055,.035),new THREE.MeshStandardMaterial({color:'#b78b50',metalness:.25,roughness:.42}));
      bow.position.set(0,1.035,.205);group.add(bow);
      for(let button=0;button<3;button++){
        const stud=new THREE.Mesh(new THREE.SphereGeometry(.012,7,6),new THREE.MeshStandardMaterial({color:'#d8bd87',metalness:.65,roughness:.28}));
        stud.position.set(0,.88-button*.095,.255);group.add(stud);
      }
    }
    if(role==='customer'&&!liteCustomer&&variant%4===0){
      const collar=new THREE.Mesh(new THREE.CylinderGeometry(.11,.16,.07,12,1,true),new THREE.MeshStandardMaterial({color:appearance.outfit,roughness:.68,side:THREE.DoubleSide}));
      collar.position.y=1.03;group.add(collar);
    }
    if(role==='kons'){
      const dress=new THREE.Mesh(new THREE.CylinderGeometry(.19,.39,.42,32,2,true),new THREE.MeshPhysicalMaterial({color:appearance.outfit,metalness:.22,roughness:.26,clearcoat:.48,clearcoatRoughness:.24,sheen:0.35,side:THREE.DoubleSide}));
      dress.name='kons-dress';dress.position.y=.43;dress.castShadow=true;dress.receiveShadow=true;group.add(dress);
      const bodice=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshPhysicalMaterial({color:appearance.outfit,metalness:.18,roughness:.25,clearcoat:.55,clearcoatRoughness:.2}));
      bodice.scale.set(.235,.19,.145);bodice.position.set(0,.88,.045);bodice.castShadow=true;group.add(bodice);
      const skirtLayer=new THREE.Mesh(new THREE.CylinderGeometry(.245,.405,.13,32,1,true),new THREE.MeshPhysicalMaterial({color:appearance.outfit,metalness:.24,roughness:.28,clearcoat:.42,side:THREE.DoubleSide}));
      skirtLayer.name='kons-skirt';skirtLayer.position.y=.27;skirtLayer.castShadow=true;group.add(skirtLayer);
      const neckline=new THREE.Mesh(new THREE.TorusGeometry(.17,.018,8,32),new THREE.MeshStandardMaterial({color:'#e7bd79',metalness:.82,roughness:.2}));
      neckline.rotation.x=Math.PI/2;neckline.position.set(0,.88,.02);group.add(neckline);
      const belt=new THREE.Mesh(new THREE.CylinderGeometry(.245,.245,.045,16),new THREE.MeshStandardMaterial({color:'#e7bd79',metalness:.8,roughness:.22}));
      belt.position.y=.57;group.add(belt);
      for(const side of [-1,1]){
        const strap=new THREE.Mesh(new THREE.BoxGeometry(.045,.28,.045),new THREE.MeshStandardMaterial({color:'#e7bd79',metalness:.65}));
        strap.position.set(side*.13,1.03,.015);strap.rotation.z=side*.13;group.add(strap);
        const shoe=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),new THREE.MeshStandardMaterial({color:variant%2?'#21131f':'#6d263e',metalness:.22,roughness:.28}));
        shoe.scale.set(.095,.055,.17);shoe.position.set(side*.13,.09,.055);group.add(shoe);
        const heel=new THREE.Mesh(new THREE.CylinderGeometry(.018,.026,.13,10),new THREE.MeshStandardMaterial({color:'#d7b16e',metalness:.78,roughness:.24}));
        heel.position.set(side*.13,.055,-.035);group.add(heel);
        const sclera=new THREE.Mesh(new THREE.SphereGeometry(.043,16,12),new THREE.MeshStandardMaterial({color:'#f5e9df',roughness:.42}));
        sclera.name=`kons-sclera-${side}`;sclera.scale.set(1.25,.72,.42);sclera.position.set(side*.075,1.36,.187);group.add(sclera);
        const iris=new THREE.Mesh(new THREE.SphereGeometry(.024,14,10),new THREE.MeshStandardMaterial({color:variant%2?'#6a4938':'#405b57',roughness:.32}));
        iris.name=`kons-iris-${side}`;iris.scale.set(1,.95,.48);iris.position.set(side*.075,1.36,.219);group.add(iris);
        const eye=new THREE.Mesh(new THREE.SphereGeometry(.013,12,8),new THREE.MeshBasicMaterial({color:'#17131a'}));
        eye.name=`kons-eye-${side}`;eye.position.set(side*.075,1.36,.231);group.add(eye);
        const eyeGlint=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshBasicMaterial({color:'#ffffff'}));
        eyeGlint.position.set(side*.068,1.37,.237);group.add(eyeGlint);
        const brow=new THREE.Mesh(new THREE.BoxGeometry(.085,.018,.025),new THREE.MeshStandardMaterial({color:hairColor,roughness:.8}));
        brow.name=`kons-brow-${side}`;brow.position.set(side*.075,1.415,.19);brow.rotation.z=side*.12;group.add(brow);
        const lash=new THREE.Mesh(new THREE.BoxGeometry(.09,.012,.018),new THREE.MeshStandardMaterial({color:'#24131c'}));
        lash.name=`kons-lash-${side}`;lash.position.set(side*.075,1.385,.198);group.add(lash);
      }
      const noseBridge=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.075,4,8),new THREE.MeshStandardMaterial({color:skin,roughness:.82}));
      noseBridge.position.set(0,1.315,.205);group.add(noseBridge);
      const nose=new THREE.Mesh(new THREE.SphereGeometry(.035,14,10),new THREE.MeshStandardMaterial({color:skin,roughness:.82}));
      nose.scale.set(.9,.72,.82);nose.position.set(0,1.285,.225);group.add(nose);
      for(const side of [-1,1]){
        const nostril=new THREE.Mesh(new THREE.SphereGeometry(.009,8,6),new THREE.MeshStandardMaterial({color:'#70463f',roughness:.9}));
        nostril.scale.set(1,.55,.45);nostril.position.set(side*.018,1.273,.242);group.add(nostril);
      }
      const upperLip=new THREE.Mesh(new THREE.SphereGeometry(.052,14,8),new THREE.MeshStandardMaterial({color:'#9e4054',roughness:.48}));
      upperLip.scale.set(1,.22,.38);upperLip.position.set(0,1.245,.218);group.add(upperLip);
      const lowerLip=new THREE.Mesh(new THREE.SphereGeometry(.047,14,8),new THREE.MeshStandardMaterial({color:'#c66a78',roughness:.42}));
      lowerLip.scale.set(.92,.2,.38);lowerLip.position.set(0,1.232,.22);group.add(lowerLip);
      const smileCurve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.055,1.25,.205),new THREE.Vector3(0,1.22,.23),new THREE.Vector3(.055,1.25,.205));
      const smile=new THREE.Mesh(new THREE.TubeGeometry(smileCurve,8,.012,5,false),new THREE.MeshBasicMaterial({color:'#7e263c'}));
      smile.name='kons-smile';group.add(smile);
      const laughMouth=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:'#4a1428'}));
      laughMouth.name='kons-laugh-mouth';laughMouth.scale.set(1,.08,.35);laughMouth.position.set(0,1.235,.205);group.add(laughMouth);
      for(const side of [-1,1]){
        const earring=new THREE.Mesh(new THREE.TorusGeometry(.035,.009,5,10),new THREE.MeshStandardMaterial({color:'#e8c27e',metalness:.8}));
        earring.position.set(side*.22,1.2,.01);group.add(earring);
        const cheek=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),new THREE.MeshBasicMaterial({color:'#c66c79',transparent:true,opacity:.42}));
        cheek.name=`kons-cheek-${side}`;cheek.position.set(side*.13,1.285,.17);cheek.scale.set(1,.48,.2);group.add(cheek);
        const bracelet=new THREE.Mesh(new THREE.TorusGeometry(.07,.012,5,12),new THREE.MeshStandardMaterial({color:'#e8c27e',metalness:.8}));
        bracelet.rotation.x=Math.PI/2;bracelet.position.set(side*.29,.73,0);group.add(bracelet);
      }
      const necklace=new THREE.Mesh(new THREE.TorusGeometry(.13,.012,5,24,Math.PI),new THREE.MeshStandardMaterial({color:'#e8c27e',metalness:.82,roughness:.2}));
      necklace.rotation.x=Math.PI/2;necklace.position.set(0,1.12,.04);group.add(necklace);
      const pendant=new THREE.Mesh(new THREE.OctahedronGeometry(.045,1),new THREE.MeshStandardMaterial({color:'#f4dca4',metalness:.7,roughness:.18}));
      pendant.position.set(0,1.075,.18);group.add(pendant);
      for(let i=0;i<5;i++){
        const gem=new THREE.Mesh(new THREE.SphereGeometry(.018,10,8),new THREE.MeshStandardMaterial({color:i%2?'#f3d7a0':'#d98b9f',metalness:.25,roughness:.2}));
        gem.position.set(-.17+i*.085,.59,.23);group.add(gem);
      }
      const hem=new THREE.Mesh(new THREE.TorusGeometry(.29,.018,5,18),new THREE.MeshStandardMaterial({color:'#e8c27e',metalness:.8}));
      hem.rotation.x=Math.PI/2;hem.position.y=.22;group.add(hem);
    }
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.045,12),new THREE.MeshStandardMaterial({color:role==='kons'?'#e3bd76':'#8f6b7b',metalness:.55}));
    ring.position.y=.04;group.add(ring);
    group.scale.set(appearance.build||1,appearance.height||1,appearance.build||1);
    group.position.set((Math.random()-.5)*14,0,(Math.random()-.5)*10);
    // A forgiving invisible hit target makes every role reliably selectable on desktop and touch.
    const cameraPickTarget=new THREE.Mesh(
      new THREE.SphereGeometry(.72,12,10),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false})
    );
    cameraPickTarget.position.y=.98;
    cameraPickTarget.userData.cameraPickTarget=group;
    group.add(cameraPickTarget);
    actorGroup.add(group);actors.set(id,group);return group;
  }
  // Navigation stays within the playable floor footprint.
  const ROOM_BOUNDS={minX:-12.3,maxX:12.3,minZ:-10.3,maxZ:10.3};
  function clampRoomPosition(x,z){
    return {x:THREE.MathUtils.clamp(x,ROOM_BOUNDS.minX,ROOM_BOUNDS.maxX),z:THREE.MathUtils.clamp(z,ROOM_BOUNDS.minZ,ROOM_BOUNDS.maxZ)};
  }
  function moveTo(id,x,z){
    const actor=actors.get(id);
    if(!actor)return;
    const point=clampRoomPosition(x,z);
    actor.userData.target=new THREE.Vector3(point.x,0,point.z);
  }
  function isBlockedCustomerSpawn(x,z){
    // Keep initial arrivals out of fixed furniture and the service/VIP work zones.
    if(z<-6.7)return true; // stage
    if(x<-8.2&&z<-2)return true; // bar
    if(x>5.4&&z<-1.2)return true; // VIP
    return tablePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<1.75);
  }
  function findCustomerSpawn(){
    let best=null,bestClearance=-Infinity;
    const candidates=[];
    // Random candidates keep the room feeling organic; a deterministic fallback grid prevents pile-ups
    // when a large batch arrives after most of the room has already filled.
    for(let attempt=0;attempt<96;attempt++){
      candidates.push({x:-11+Math.random()*22,z:-9.8+Math.random()*19.2});
    }
    for(let row=0;row<27;row++){
      for(let column=0;column<31;column++){
        candidates.push({x:-11.25+column*.75,z:-9.75+row*.74});
      }
    }
    for(const candidate of candidates){
      const {x,z}=candidate;
      if(isBlockedCustomerSpawn(x,z))continue;
      let clearance=Infinity;
      actors.forEach(other=>{
        clearance=Math.min(clearance,Math.hypot(x-other.position.x,z-other.position.z));
      });
      if(clearance>bestClearance){best=candidate;bestClearance=clearance;}
      if(clearance>=1.05)return candidate;
    }
    // At maximum density, use the least crowded valid location rather than a single fallback point.
    return best||clampRoomPosition(0,8.8);
  }
  function findCustomerEntrance(){
    let best=null,bestClearance=-Infinity;
    // Spread simultaneous arrivals through the doorway and the first few metres of the entrance lane.
    for(let row=0;row<14;row++){
      for(let column=0;column<7;column++){
        const point=clampRoomPosition((column-3)*.38,9.55-row*.42);
        let clearance=Infinity;
        actors.forEach(other=>{
          clearance=Math.min(clearance,Math.hypot(point.x-other.position.x,point.z-other.position.z));
        });
        if(clearance>bestClearance){best=point;bestClearance=clearance;}
        if(clearance>=.62)return point;
      }
    }
    return best||clampRoomPosition(0,9.55);
  }
  function addCustomer(viewer){
    if(!viewer||typeof viewer.id!=='string'||!viewer.id.trim()||typeof viewer.name!=='string'||!viewer.name.trim()||actors.has(viewer.id))return false;
    const variant=customerSequence++;
    const spawn=findCustomerSpawn();
    const entrance=findCustomerEntrance();
    const actor=makeActor(viewer.id,'customer',variant);
    updateCrowdQuality();
    actor.userData.name=viewer.name;
    actor.position.set(entrance.x,0,entrance.z);
    actor.userData.home=new THREE.Vector3(spawn.x,0,spawn.z);
    actor.userData.motion='arriving';
    moveTo(viewer.id,spawn.x,spawn.z);
    return true;
  }
  function releaseSeat(actor){
    const spot=actor.userData.seat;
    if(!spot)return;
    spot.occupied=false;
    if(spot.mesh?.material){spot.mesh.material.color.set('#8c2545');spot.mesh.material.emissive.set('#000000');spot.mesh.material.emissiveIntensity=0;}
    const table=tableStates[spot.tableId-1];
    if(table)table.occupied=Math.max(0,table.occupied-1);
    actor.userData.seat=null;
  }
  function seatCustomer(id){
    const actor=actors.get(id);if(!actor)return false;
    const currentSeat=actor.userData.seat;
    // Keep an already assigned seat; otherwise choose the closest free chair.
    const spot=currentSeat&&currentSeat.occupied
      ? currentSeat
      : seatSpots
          .filter(item=>!item.occupied)
          // Balance walking distance against current table occupancy so guests naturally share tables.
          .sort((a,b)=>{
            const tableA=tableStates[a.tableId-1],tableB=tableStates[b.tableId-1];
            const scoreA=Math.hypot(a.x-actor.position.x,a.z-actor.position.z)+tableA.occupied*1.25;
            const scoreB=Math.hypot(b.x-actor.position.x,b.z-actor.position.z)+tableB.occupied*1.25;
            return scoreA-scoreB;
          })[0];
    if(!spot)return false;
    if(currentSeat!==spot){
      releaseSeat(actor);
      spot.occupied=true;
      if(spot.mesh?.material){spot.mesh.material.color.set('#d6a65d');spot.mesh.material.emissive.set('#6a3c1d');spot.mesh.material.emissiveIntensity=.35;}
      const table=tableStates[spot.tableId-1];
      if(table)table.occupied+=1;
      actor.userData.seat=spot;
    }
    actor.userData.motion='walking-to-seat';actor.userData.targetRotation=spot.rotation;
    moveTo(id,spot.x,spot.z);
    return true;
  }
  function prepareGuestForInteraction(actor){
    const wasSeated=Boolean(actor.userData.seat)||actor.userData.motion==='seated'||actor.userData.motion==='sitting-down';
    if(wasSeated){
      actor.userData.poseFrom=capturePose(actor);
      actor.userData.poseStarted=clock?.elapsedTime||0;
    }
    releaseSeat(actor);
    actor.userData.motion='standing';
    delete actor.userData.sitStarted;
    if(actor.userData.body){actor.userData.body.position.y=.72;actor.userData.body.rotation.x=0;}
    if(actor.userData.head)actor.userData.head.position.y=1.35;
    actor.userData.legPivots?.forEach(leg=>leg.rotation.x=0);
    actor.userData.armPivots?.forEach(arm=>{arm.rotation.x=0;arm.rotation.z=0;});
  }
  function capturePose(actor){
    const rotations=list=>(list||[]).map(part=>({x:part.rotation.x,y:part.rotation.y,z:part.rotation.z}));
    return {
      root:{x:actor.rotation.x,y:actor.rotation.y,z:actor.rotation.z},
      y:actor.position.y,
      body:actor.userData.body?{positionY:actor.userData.body.position.y,rotation:{x:actor.userData.body.rotation.x,y:actor.userData.body.rotation.y,z:actor.userData.body.rotation.z}}:null,
      head:actor.userData.head?{positionY:actor.userData.head.position.y,rotation:{x:actor.userData.head.rotation.x,y:actor.userData.head.rotation.y,z:actor.userData.head.rotation.z}}:null,
      arms:rotations(actor.userData.armPivots),legs:rotations(actor.userData.legPivots)
    };
  }
  function beginMotion(actor,nextMotion){
    if(actor.userData.motion===nextMotion)return;
    actor.userData.poseFrom=capturePose(actor);
    actor.userData.poseStarted=clock?.elapsedTime||0;
    actor.userData.motion=nextMotion;
  }
  function animateActor(id,kind){
    const actor=actors.get(id);if(!actor)return false;
    if(kind==='seat')return seatCustomer(id);
    releaseSeat(actor);
    if(actor.userData.role==='customer'){
      if(actor.userData.body)actor.userData.body.position.y=.72;
      if(actor.userData.head)actor.userData.head.position.y=1.35;
      actor.userData.legPivots?.forEach(leg=>leg.rotation.x=0);
      actor.userData.armPivots?.forEach(arm=>{arm.rotation.x=0;arm.rotation.z=0;});
    }
    const targets={dance:[(Math.random()-.5)*4,1],stage:[0,-8.5]};
    const target=targets[kind]||targets.dance;moveTo(id,target[0],target[1]);beginMotion(actor,kind);return true;
  }
  for(let i=1;i<=10;i++){
    const id='kons-'+i;const actor=makeActor(id,'kons',i-1);
    actor.position.set(-10+((i-1)%5)*5,0,-2+Math.floor((i-1)/5)*2);
    actor.userData.home=actor.position.clone();konsHomes.set(id,actor.position.clone());
  }
  for(let i=1;i<=5;i++){
    const id='waiter-'+i;const actor=makeActor(id,'waiter',i-1);
    actor.position.set(-10+((i-1)%5)*1.5,0,-5);actor.userData.home=actor.position.clone();waiterHomes.set(id,actor.position.clone());
  }

  // Keep the dance floor visibly active with three permanent background NPC pairs.
  // Their slots are reserved so live gift interactions use the remaining dance positions.
  const ambientDancePairs=3;
  for(let i=0;i<ambientDancePairs;i++){
    const slot=danceSlots[i];
    const hostessId=`npc-kons-${i+1}`;
    const guestId=`npc-customer-${i+1}`;
    const hostess=makeActor(hostessId,'kons',(i+6)%10);
    const guest=makeActor(guestId,'customer',200+i);
    hostess.position.set(slot.x+.65,0,slot.z);
    guest.position.set(slot.x-.65,0,slot.z);
    hostess.rotation.y=-Math.PI/2;
    guest.rotation.y=Math.PI/2;
    hostess.userData.motion='dance';
    guest.userData.motion='dance';
    hostess.userData.ambientNpc=true;
    guest.userData.ambientNpc=true;
    hostess.userData.danceStyle=i%3;
    guest.userData.danceStyle=i%3;
    hostess.userData.danceTempo=[0.92,1.08,1.2][i%3];
    guest.userData.danceTempo=[1.02,0.94,1.14][i%3];
    interactionReservations.reserveDance(hostessId,guestId);
  }


  // Live pavyon ensemble: bağlama, keyboard, darbuka and clarinet players.
  const bandMembers=[];
  const musicianRoles=['baglama','keyboard','darbuka','clarinet'];
  function addBandInstrument(actor,kind){
    const wood=new THREE.MeshStandardMaterial({color:'#9a542e',roughness:.38,metalness:.12});
    const dark=new THREE.MeshStandardMaterial({color:'#211a22',roughness:.32,metalness:.28});
    const brass=new THREE.MeshStandardMaterial({color:'#d7ae62',roughness:.24,metalness:.78});
    const ivory=new THREE.MeshStandardMaterial({color:'#eee2c9',roughness:.5});
    if(kind==='baglama'){
      const playingHand=new THREE.Group();playingHand.position.set(.27,.91,.4);actor.add(playingHand);actor.userData.instrumentHands=[playingHand];
      const bowl=new THREE.Mesh(new THREE.SphereGeometry(.22,18,12),wood);
      bowl.scale.set(.72,.48,.34);bowl.position.set(0,.76,.34);actor.add(bowl);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.92,10),wood);
      neck.position.set(.25,.91,.36);neck.rotation.z=-.28;actor.add(neck);
      for(let n=0;n<3;n++){const string=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.91,5),brass);string.position.set(.25+(n-1)*.014,.91,.395);string.rotation.z=-.28;actor.add(string);}
      const bridge=new THREE.Mesh(new THREE.BoxGeometry(.2,.025,.035),brass);bridge.position.set(0,.76,.62);actor.add(bridge);
    }else if(kind==='keyboard'){
      const stand=new THREE.Group();actor.userData.instrumentKeys=[];
      const top=new THREE.Mesh(new THREE.BoxGeometry(.95,.11,.28),dark);top.position.y=.92;stand.add(top);
      for(let n=0;n<14;n++){const key=new THREE.Mesh(new THREE.BoxGeometry(.061,.018,.19),ivory);key.position.set(-.42+n*.064,.985,.055);stand.add(key);actor.userData.instrumentKeys.push(key);}
      for(let n=0;n<10;n++){const key=new THREE.Mesh(new THREE.BoxGeometry(.035,.024,.1),dark);key.position.set(-.385+n*.064,1.005,-.005);stand.add(key);}
      const legA=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.82,7),dark);legA.position.set(-.34,.46,0);stand.add(legA);
      const legB=legA.clone();legB.position.x=.34;stand.add(legB);actor.add(stand);
    }else if(kind==='darbuka'){
      const drum=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,.48,18,1),new THREE.MeshStandardMaterial({color:'#b7a2a0',metalness:.5,roughness:.3}));
      drum.position.set(0,.67,.34);drum.rotation.x=-.18;actor.add(drum);actor.userData.drum=drum;
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.12,.018,8,24),brass);rim.position.set(0,.91,.36);actor.add(rim);
    }else{
      const tube=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.78,12),dark);tube.position.set(0,.83,.35);tube.rotation.z=.12;actor.add(tube);
      actor.userData.clarinetRings=[];
      for(let n=0;n<7;n++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.037,.009,5,12),brass);ring.position.set(0,.5+n*.105,.35);ring.rotation.x=Math.PI/2;actor.add(ring);actor.userData.clarinetRings.push(ring);}
      const bell=new THREE.Mesh(new THREE.ConeGeometry(.095,.2,14),brass);bell.position.set(.01,.38,.35);bell.rotation.x=Math.PI;actor.add(bell);
    }
  }
  // Front-stage vocalist anchors the live ensemble.
  const vocalist=makeActor('band-vocalist','musician',29);
  vocalist.position.set(0,0,-8.12);
  vocalist.rotation.y=0;
  vocalist.userData.instrument='vocal';
  vocalist.userData.motion='performing';
  vocalist.userData.vocalist=true;
  vocalist.userData.entranceDuration=3.2;
  vocalist.userData.stageFrontZ=-6.75;
  const micStand=new THREE.Group();
  const micMetal=new THREE.MeshStandardMaterial({color:'#29242a',metalness:.72,roughness:.28});
  const micGold=new THREE.MeshStandardMaterial({color:'#c59a5b',metalness:.78,roughness:.22});
  const standPole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.024,1.12,10),micMetal);
  standPole.position.set(.42,.62,.34);micStand.add(standPole);
  const standBase=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.045,16),micMetal);
  standBase.position.set(.42,.055,.34);micStand.add(standBase);
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.48,8),micMetal);
  boom.position.set(.22,1.12,.34);boom.rotation.z=-.22;micStand.add(boom);
  const microphone=new THREE.Mesh(new THREE.CylinderGeometry(.045,.035,.18,12),micGold);
  microphone.position.set(.02,1.17,.34);microphone.rotation.z=Math.PI/2-.22;micStand.add(microphone);
  const micHead=new THREE.Mesh(new THREE.SphereGeometry(.052,12,10),micMetal);
  micHead.position.set(-.07,1.19,.34);micStand.add(micHead);
  vocalist.add(micStand);
  vocalist.userData.micStand=micStand;
  const micInHand=new THREE.Group();
  const handheldBody=new THREE.Mesh(new THREE.CylinderGeometry(.026,.032,.2,10),micMetal);
  handheldBody.rotation.z=-.35;micInHand.add(handheldBody);
  const handheldHead=new THREE.Mesh(new THREE.SphereGeometry(.045,12,10),micGold);
  handheldHead.position.set(-.035,.09,0);micInHand.add(handheldHead);
  micInHand.position.set(-.27,.98,.27);vocalist.add(micInHand);
  vocalist.userData.micInHand=micInHand;
  vocalist.userData.armPivots[0].rotation.z=-.58;
  vocalist.userData.armPivots[0].rotation.x=-.18;
  bandMembers.push(vocalist);

  // Two adult stage performers flank the singer and add a restrained pavyon accompaniment.
  const stagePerformers=[];
  for(let i=0;i<2;i++){
    const dancer=makeActor(`stage-kons-${i+1}`,'kons',(i+3)%10);
    dancer.position.set(i===0?-3.05:3.05,0,-6.72);
    dancer.rotation.y=i===0?.28:-.28;
    dancer.userData.stagePerformer=true;
    dancer.userData.ambientNpc=true;
    dancer.userData.motion='stage-performance';
    dancer.userData.stageSide=i===0?-1:1;
    stagePerformers.push(dancer);
  }

  for(let i=0;i<musicianRoles.length;i++){
    const actor=makeActor(`band-${musicianRoles[i]}`,'musician',i+20);
    actor.position.set(-3.05+i*2.03,0,-8.05);
    actor.rotation.y=0;
    actor.userData.instrument=musicianRoles[i];
    actor.userData.motion='performing';
    addBandInstrument(actor,musicianRoles[i]);
    if(musicianRoles[i]!=='clarinet'){
      actor.userData.seatedPerformer=true;
      actor.userData.body.position.y=.64;
      actor.userData.head.position.y=1.25;
      actor.userData.armPivots.forEach(arm=>{arm.position.y=.91;});
      actor.userData.legPivots.forEach((leg,index)=>{leg.rotation.x=index===0?-.48:-.62;leg.rotation.z=index===0?-.12:.12;});
      const stool=new THREE.Group();
      const seat=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.09,18),new THREE.MeshStandardMaterial({color:'#382432',roughness:.48}));
      seat.position.y=.58;stool.add(seat);
      const cushion=new THREE.Mesh(new THREE.CylinderGeometry(.235,.235,.045,18),new THREE.MeshStandardMaterial({color:'#9b3454',roughness:.68}));
      cushion.position.y=.65;stool.add(cushion);
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.5,10),new THREE.MeshStandardMaterial({color:'#b78c50',metalness:.68,roughness:.32}));
      stem.position.y=.3;stool.add(stem);
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.055,16),new THREE.MeshStandardMaterial({color:'#3a2a2c',metalness:.48,roughness:.38}));
      base.position.y=.055;stool.add(base);
      actor.add(stool);
    }
    bandMembers.push(actor);
  }

  function findWaiterApproach(waiter,guest){
    // Pick a clear side of the guest instead of sending every waiter to the same offset.
    const candidates=[
      {x:guest.position.x-1.05,z:guest.position.z},
      {x:guest.position.x+1.05,z:guest.position.z},
      {x:guest.position.x,z:guest.position.z-1.05},
      {x:guest.position.x,z:guest.position.z+1.05}
    ];
    let best=null,bestScore=Infinity;
    candidates.forEach((candidate,index)=>{
      const point=clampRoomPosition(candidate.x,candidate.z);
      const distance=Math.hypot(point.x-waiter.position.x,point.z-waiter.position.z);
      let clearance=Infinity;
      actors.forEach(other=>{
        if(other===waiter||other===guest)return;
        clearance=Math.min(clearance,Math.hypot(point.x-other.position.x,point.z-other.position.z));
      });
      // Prefer short routes, but penalize standing too close to another actor.
      const crowdPenalty=clearance<.9?( .9-clearance)*3.2:0;
      const edgePenalty=(point.x!==candidate.x||point.z!==candidate.z)?.35:0;
      const score=distance+crowdPenalty+edgePenalty+index*.0001;
      if(score<bestScore){bestScore=score;best=point;}
    });
    return best||clampRoomPosition(guest.position.x-1.05,guest.position.z);
  }
  const waiterServices=createWaiterServiceManager({
    queue:waiterQueue,
    ledger:activeCustomerServices,
    getActor:id=>actors.get(id),
    getWaiterIds:()=>waiterHomes.keys(),
    getHome:id=>waiterHomes.get(id),
    findApproach:findWaiterApproach,
    moveTo,
    setMotion:(id,motion)=>{const actor=actors.get(id);if(actor)actor.userData.motion=motion;},
    setTimer:(callback,delay)=>window.setTimeout(callback,delay),
    clearTimer:timer=>window.clearTimeout(timer),
    serviceDuration:4500
  });

  function resetKonsHome(id){
    const home=konsHomes.get(id),actor=actors.get(id);
    if(home&&actor){moveTo(id,home.x,home.z);actor.userData.motion='idle';}
  }
  function resetGuestHome(id){
    const actor=actors.get(id);
    if(!actor)return;
    releaseSeat(actor);actor.userData.motion='idle';
    if(actor.userData.body){actor.userData.body.position.y=.72;actor.userData.body.rotation.x=0;}
    if(actor.userData.head)actor.userData.head.position.y=1.35;
    actor.userData.legPivots?.forEach(leg=>leg.rotation.x=0);
    actor.userData.armPivots?.forEach(arm=>{arm.rotation.x=0;arm.rotation.z=0;});
    const home=actor.userData.home;
    if(home)moveTo(id,home.x,home.z);
  }
  function releaseInteractionPair(pair){
    if(!pair)return false;
    resetKonsHome(pair.ownerId);
    resetGuestHome(pair.guestId);
    return true;
  }

  const clock=new THREE.Clock();
  function updateCrowdQuality(){
    const mobile=(canvas.clientWidth||window.innerWidth)<700;
    const crowded=actors.size>30;
    const pixelRatio=Math.min(window.devicePixelRatio||1,mobile||crowded?1:1.5);
    if(renderer.getPixelRatio()!==pixelRatio)renderer.setPixelRatio(pixelRatio);
    const shadows=!mobile&&!crowded;
    if(renderer.shadowMap.enabled!==shadows)renderer.shadowMap.enabled=shadows;
    key.castShadow=shadows;
  }
  function resize(){
    const width=canvas.clientWidth||window.innerWidth,height=canvas.clientHeight||window.innerHeight;
    const mobile=width<700;
    updateCrowdQuality();
    renderer.setSize(width,height,false);camera.aspect=width/height;
    // Keep the room overview on resize; selected-character framing is updated smoothly each frame.
    camera.fov=width<700?48:43;
    if(!followedActor)cameraDistance=width<700?31:27;
    camera.updateProjectionMatrix();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  let raf=0;
  let disposed=false;
  let musicMood='pavyon';
  function tick(){
    raf=requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;
    stageSpotlights.forEach(({beam,phase})=>{
      const ankara=musicMood==='ankara';
      beam.color.set(ankara?(phase%Math.PI===0?'#f05b91':'#f6c66e'):(phase%Math.PI===0?'#f6c5d2':'#f4d28c'));
      const sweep=Math.sin(time*(ankara?.72:.42)+phase);
      beam.target.position.x=sweep*3.8;
      beam.target.position.z=-2.5+Math.cos(time*.31+phase)*1.6;
      beam.intensity=(ankara?15:13)+Math.max(0,Math.sin(time*(ankara?2.5:1.7)+phase))* (ankara?10:8);
    });
    vipLights.forEach((light,index)=>{light.intensity=2.5+Math.sin(time*1.15+index*1.7)*.55;});
    danceWash.intensity=6.5+Math.sin(time*2.2)*1.5;
    stageWash.forEach((wash,index)=>{const phase=index*Math.PI/2;const ankara=musicMood==='ankara';wash.material.color.set(ankara?(index%2?'#e34d8b':'#ef9b55'):(index%2?'#e6b8d0':'#f1d49c'));wash.position.y=3.5;wash.position.x=-3+index*2;wash.rotation.x=Math.PI/2;wash.rotation.z=Math.sin(time*(ankara?.72:.42)+phase)*.13;wash.material.opacity=.035+Math.max(0,Math.sin(time*(ankara?2.5:1.7)+phase))*.035;});
    // Build a lightweight spatial hash once per frame so moving actors only inspect nearby neighbors.
    const separationCellSize=.82;
    const separationGrid=new Map();
    const separationKey=(x,z)=>`${Math.floor(x/separationCellSize)},${Math.floor(z/separationCellSize)}`;
    actors.forEach(actor=>{
      const key=separationKey(actor.position.x,actor.position.z);
      if(!separationGrid.has(key))separationGrid.set(key,[]);
      separationGrid.get(key).push(actor);
    });
    actors.forEach(actor=>{
      const target=actor.userData.target;
      let walking=false;
      if(target){
        let dx=target.x-actor.position.x,dz=target.z-actor.position.z;
        const distance=Math.hypot(dx,dz);
        if(distance>.08){
          walking=true;
          // Soft local separation: moving actors steer around nearby people instead of walking through them.
          let avoidX=0,avoidZ=0;
          const cellX=Math.floor(actor.position.x/separationCellSize);
          const cellZ=Math.floor(actor.position.z/separationCellSize);
          for(let gx=cellX-1;gx<=cellX+1;gx++){
            for(let gz=cellZ-1;gz<=cellZ+1;gz++){
              const nearby=separationGrid.get(`${gx},${gz}`)||[];
              nearby.forEach(other=>{
                if(other===actor)return;
                const ox=actor.position.x-other.position.x,oz=actor.position.z-other.position.z;
                const gap=Math.hypot(ox,oz);
                if(gap>0.001&&gap<separationCellSize){
                  const force=(separationCellSize-gap)/separationCellSize;
                  avoidX+=(ox/gap)*force;
                  avoidZ+=(oz/gap)*force;
                }
              });
            }
          }
          const avoidLength=Math.hypot(avoidX,avoidZ);
          if(avoidLength>.001){
            const strength=Math.min(.72,avoidLength*.42);
            dx+=avoidX/avoidLength*strength;
            dz+=avoidZ/avoidLength*strength;
          }
          const steeredDistance=Math.hypot(dx,dz)||1;
          const speed=actor.userData.role==='kons'?1.85:actor.userData.role==='waiter'?2.15:2.0;
          const step=Math.min(distance,dt*speed);
          actor.position.x+=dx/steeredDistance*step;
          actor.position.z+=dz/steeredDistance*step;
          actor.userData.gaitPhase+=dt*(5.2+speed*.45);
          const safePosition=clampRoomPosition(actor.position.x,actor.position.z);
          actor.position.x=safePosition.x;actor.position.z=safePosition.z;
          const desiredRotation=Math.atan2(dx,dz);
          let angle=desiredRotation-actor.rotation.y;
          angle=Math.atan2(Math.sin(angle),Math.cos(angle));
          actor.rotation.y+=angle*Math.min(1,dt*7);
        }else {
          actor.userData.target=null;
          if(actor.userData.motion==='arriving')actor.userData.motion='idle';
          if(actor.userData.motion==='dance'||actor.userData.motion==='stage'){
            actor.userData.poseFrom=capturePose(actor);
            actor.userData.poseStarted=time;
          }
          if(actor.userData.targetRotation!==undefined){actor.rotation.y=actor.userData.targetRotation;delete actor.userData.targetRotation;}
          if(actor.userData.motion==='walking-to-seat'){
            actor.userData.motion='sitting-down';
            actor.userData.sitStarted=time;
          }
        }
      }
      if(actor.userData.role==='kons'){
        const flirt=Math.sin(time*1.7+actor.userData.flirtPhase);
        actor.rotation.z=(actor.userData.motion==='dance'?Math.sin(time*7+actor.userData.phase)*.18:flirt*.035);
        const smile=actor.getObjectByName('kons-smile');
        const laughMouth=actor.getObjectByName('kons-laugh-mouth');
        const blink=Math.pow(Math.max(0,Math.sin(time*.9+actor.userData.flirtPhase*3)),36);
        const expression=Math.max(0,flirt);
        [-1,1].forEach(side=>{
          const eye=actor.getObjectByName(`kons-eye-${side}`);
          const sclera=actor.getObjectByName(`kons-sclera-${side}`);
          const iris=actor.getObjectByName(`kons-iris-${side}`);
          const lash=actor.getObjectByName(`kons-lash-${side}`);
          const brow=actor.getObjectByName(`kons-brow-${side}`);
          const cheek=actor.getObjectByName(`kons-cheek-${side}`);
          const eyeOpen=Math.max(.08,1-blink*.94);
          if(eye)eye.scale.y=eyeOpen;
          if(sclera)sclera.scale.y=.72*eyeOpen;
          if(iris)iris.scale.y=.95*eyeOpen;
          if(lash)lash.scale.y=1+blink*.7;
          if(brow)brow.rotation.z=side*(.12+expression*.045);
          if(cheek)cheek.material.opacity=.3+expression*.22;
        });
        const stagePerforming=actor.userData.stagePerformer===true;
        const dancing=actor.userData.motion==='dance'&&!walking;
        const baseDanceStyle=Number.isInteger(actor.userData.danceStyle)?actor.userData.danceStyle:(Number(actor.userData.id.split('-')[1])-1)%3;
        const dancePhrase=(time+actor.userData.phase*1.7)/12;
        const phraseIndex=Math.floor(dancePhrase);
        const phraseProgress=dancePhrase-phraseIndex;
        const danceStyle=dancing?(baseDanceStyle+phraseIndex)%3:baseDanceStyle;
        const previousDanceStyle=(danceStyle+2)%3;
        const phraseBlend=THREE.MathUtils.smoothstep(phraseProgress,0,.2);
        const rhythm=(musicMood==='ankara'?1.16:1)*(actor.userData.danceTempo||1);
        const stride=walking?Math.sin(actor.userData.gaitPhase):0;
        const walkCounter=walking?Math.sin(actor.userData.gaitPhase+Math.PI):0;
        actor.position.y=walking?Math.abs(stride)*.025:(dancing?Math.abs(Math.sin(time*6.2*rhythm+actor.userData.phase))*.035:(stagePerforming?Math.abs(Math.sin(time*2.7+actor.userData.phase))*.018:Math.max(0,flirt)*.012));
        if(actor.userData.body){
          actor.userData.body.rotation.z=walking?stride*.035:(dancing?Math.sin(time*4*rhythm+actor.userData.phase)*.045:(stagePerforming?Math.sin(time*2.1+actor.userData.phase)*.035:0));
          actor.userData.body.rotation.y=dancing?Math.sin(time*3.1*rhythm+actor.userData.phase)*.09:(stagePerforming?Math.sin(time*.8+actor.userData.phase)*.12:0);
        }
        if(actor.userData.head)actor.userData.head.rotation.x=walking?-Math.abs(stride)*.025:(dancing?Math.sin(time*6.2+actor.userData.phase)*.025:(stagePerforming?Math.sin(time*1.3+actor.userData.phase)*.025:0));
        actor.userData.armPivots?.forEach((arm,index)=>{
          const side=index===0?-1:1;
          const beat=time*(danceStyle===1?5.5:danceStyle===2?6.4:8)*rhythm+index+actor.userData.phase;
          const armForStyle=style=>{
            const styleBeat=time*(style===1?5.5:style===2?6.4:8)*rhythm+index+actor.userData.phase;
            return style===0?side*(.78+Math.sin(styleBeat)*.2):style===1?(index===0?-.25:.95)+Math.sin(styleBeat)*.22:side*(.48+Math.sin(styleBeat)*.42);
          };
          const danceArm=THREE.MathUtils.lerp(armForStyle(previousDanceStyle),armForStyle(danceStyle),phraseBlend);
          const choreography=stagePerforming?Math.floor(time/12)%3:0;
          const phrase=(time%12)/12;
          const wave=stagePerforming?Math.max(0,Math.sin(phrase*Math.PI*2+index*.75)):0;
          const stageGesture=stagePerforming?(choreography===0?wave:choreography===1?Math.sin(phrase*Math.PI*4+index*Math.PI):Math.max(0,Math.sin(phrase*Math.PI*2))):0;
          const stageArm=choreography===0?(index===0?-.58:.58):choreography===1?(index===0?-.95:.95):(index===0?-.2:.2);
          arm.rotation.z=dancing?danceArm:(stagePerforming?stageArm+stageGesture*(choreography===1?.18:.3):(walking?side*(.08+stride*.19):side*(.12+Math.sin(time*1.8+actor.userData.flirtPhase+index)*.09)));
          arm.rotation.x=dancing?Math.sin(time*(danceStyle===2?3.8:5)*rhythm+index)*.16:(stagePerforming?Math.sin(time*1.5+index)*.1:(walking?stride*.1:Math.sin(time*1.3+index)*.04));
        });
        actor.userData.legPivots?.forEach((leg,index)=>{
          const footBeat=time*(danceStyle===1?6:danceStyle===2?5.2:8)*rhythm+index*Math.PI+actor.userData.phase;
          const stepAmplitude=danceStyle===2?.18:danceStyle===1?.2:.24;
          const heelTap=danceStyle===1?Math.max(0,Math.sin(footBeat))*.12:Math.sin(footBeat)*stepAmplitude;
          leg.rotation.x=dancing?heelTap:(walking?Math.sin(actor.userData.gaitPhase+index*Math.PI)*.3:Math.sin(time*1.4+index)*.015);
        });
        const laughing=actor.userData.motion==='laugh'||(Math.sin(time*.72+actor.userData.flirtPhase*2)>.985);
        const head=actor.userData.head;
        const hairSway=Math.sin(time*(dancing?5.2*rhythm:walking?4.2:1.7)+actor.userData.phase);
        [-1,1].forEach(side=>{
          const lock=actor.getObjectByName(`kons-hair-lock-${side}`);
          if(lock)lock.rotation.z=side*(.12+hairSway*(dancing?.09:walking?.055:.018));
        });
        for(let strand=0;strand<5;strand++){
          const strandMesh=actor.getObjectByName(`kons-hair-strand-${strand}`);
          if(strandMesh)strandMesh.rotation.x=hairSway*(dancing?.045:walking?.025:.009)*(strand%2?1:-1);
        }
        const ponytail=actor.getObjectByName('kons-ponytail');
        if(ponytail){
          ponytail.rotation.x=-.25+hairSway*(dancing?.2:walking?.12:.035);
          ponytail.rotation.z=hairSway*(dancing?.12:walking?.07:.02);
        }
        const dress=actor.getObjectByName('kons-dress');
        const skirt=actor.getObjectByName('kons-skirt');
        const fabricSway=dancing?Math.sin(time*5.4*rhythm+actor.userData.phase):walking?stride:Math.sin(time*1.4+actor.userData.phase)*.18;
        if(dress)dress.rotation.z=fabricSway*(dancing?.075:walking?.035:.012);
        if(skirt){skirt.rotation.z=fabricSway*(dancing?.14:walking?.065:.025);skirt.rotation.x=dancing?Math.cos(time*5.4*rhythm+actor.userData.phase)*.035:0;}
        const headTilt=actor.userData.motion==='flirt'?Math.sin(time*2+actor.userData.flirtPhase)*.065:
          (dancing?Math.sin(time*3.1*rhythm+actor.userData.phase)*.035:Math.sin(time*.8+actor.userData.flirtPhase)*.012);
        if(head){
          head.rotation.z=headTilt;
          head.rotation.y=dancing?Math.sin(time*2.4*rhythm+actor.userData.phase)*.055:Math.sin(time*.65+actor.userData.flirtPhase)*.018;
        }
        if(actor.userData.body&&dancing){
          actor.userData.body.rotation.x=Math.sin(time*4.1*rhythm+actor.userData.phase)*.025;
          actor.userData.body.rotation.z=Math.sin(time*4*rhythm+actor.userData.phase)*.055;
        }else if(actor.userData.body){actor.userData.body.rotation.x=0;}
        if(smile)smile.scale.y=laughing?.45:1+Math.max(0,flirt)*.32;
        if(laughMouth){laughMouth.scale.y=laughing?.9:.08;}
        if(laughing&&head)head.rotation.x-=Math.abs(Math.sin(time*8+actor.userData.phase))*.035;
        if(laughing)actor.position.y+=Math.abs(Math.sin(time*10+actor.userData.phase))*.025;
      }else if(actor.userData.role==='customer'){
        const motion=actor.userData.motion;
        const dancing=motion==='dance'&&!walking;
        const customerRhythm=(musicMood==='ankara'?1.16:1)*(actor.userData.danceTempo||1);
        const customerBeat=6.2*customerRhythm;
        const gait=walking?Math.sin(actor.userData.gaitPhase):0;
        const sittingDown=motion==='sitting-down'&&!walking;
        const seatedNow=motion==='seated'||sittingDown;
        const sitBlend=seatedNow?THREE.MathUtils.smoothstep((time-(actor.userData.sitStarted??time))/.62,0,1):0;
        if(sittingDown&&sitBlend>=1)actor.userData.motion='seated';
        const idleStanding=motion==='idle'&&!walking&&!seatedNow;
        const idleSeated=motion==='seated'||sittingDown;
        const idlePhase=time*.85+actor.userData.phase;
        const breathing=idleStanding||idleSeated?Math.sin(idlePhase)*.008:0;
        if(actor.userData.body){
          actor.userData.body.position.y=.72-.16*sitBlend+breathing;
          actor.userData.body.rotation.x=.12*sitBlend+(idleStanding?Math.sin(idlePhase*.7)*.012:0);
          actor.userData.body.rotation.z=dancing?Math.sin(time*3.1*customerRhythm+actor.userData.phase)*.035:(idleStanding?Math.sin(idlePhase*.55)*.012:0);
        }
        let socialYaw=0;
        if(idleStanding||idleSeated){
          let nearest=null,nearestDistance=3.4;
          const cellX=Math.floor(actor.position.x/separationCellSize);
          const cellZ=Math.floor(actor.position.z/separationCellSize);
          for(let gx=cellX-4;gx<=cellX+4;gx++){
            for(let gz=cellZ-4;gz<=cellZ+4;gz++){
              const nearby=separationGrid.get(`${gx},${gz}`)||[];
              nearby.forEach(other=>{
                if(other===actor||other.userData.role!=='customer')return;
                const ox=other.position.x-actor.position.x,oz=other.position.z-actor.position.z;
                const distance=Math.hypot(ox,oz);
                if(distance>1.15&&distance<nearestDistance){nearest=other;nearestDistance=distance;}
              });
            }
          }
          if(nearest){
            const worldAngle=Math.atan2(nearest.position.x-actor.position.x,nearest.position.z-actor.position.z);
            let relative=worldAngle-actor.rotation.y;
            relative=Math.atan2(Math.sin(relative),Math.cos(relative));
            socialYaw=THREE.MathUtils.clamp(relative,-.28,.28);
          }
        }
        if(actor.userData.head){
          actor.userData.head.position.y=1.35-.16*sitBlend;
          const idleYaw=(idleStanding||idleSeated)?Math.sin(time*.48+actor.userData.phase)*.045:0;
          const desiredHeadYaw=socialYaw+idleYaw;
          actor.userData.head.rotation.y=THREE.MathUtils.lerp(actor.userData.head.rotation.y,desiredHeadYaw,Math.min(1,dt*1.8));
          actor.userData.head.rotation.z=idleStanding?Math.sin(time*.72+actor.userData.phase)*.018:0;
        }
        actor.position.y=walking?Math.abs(gait)*.025:(dancing?Math.abs(Math.sin(time*5.8*customerRhythm+actor.userData.phase))*.035:0);
        actor.rotation.z=walking?gait*.025:(dancing?Math.sin(time*5.8+actor.userData.phase)*.08:(seatedNow?-.035:0));
        if(actor.userData.body)actor.userData.body.rotation.z=dancing?Math.sin(time*3.1+actor.userData.phase)*.035:(idleStanding?Math.sin(idlePhase*.55)*.012:0);
        actor.userData.legPivots?.forEach((leg,index)=>{
          const seatedAngle=-.95+(index*.04);
          const activeAngle=dancing?Math.sin(time*customerBeat+index*Math.PI+actor.userData.phase)*.3:(walking?Math.sin(actor.userData.gaitPhase+index*Math.PI)*.3:0);
          leg.rotation.x=activeAngle+(seatedAngle-activeAngle)*sitBlend;
        });
        actor.userData.armPivots?.forEach((arm,index)=>{
          const activeX=dancing?Math.sin(time*customerBeat+index*Math.PI)*.16:(walking?gait*.08:(idleStanding?Math.sin(idlePhase+index*1.4)*.018:0));
          const activeZ=dancing?(index===0?-1:1)*(.36+Math.sin(time*customerBeat+index)*.2):(walking?(index===0?1:-1)*gait*.16:(idleStanding?Math.sin(idlePhase*.8+index)*.012:0));
          arm.rotation.x=activeX+(-.25-activeX)*sitBlend;
          const seatedZ=(index===0?-.12:.12)+(idleSeated?Math.sin(idlePhase*.7+index)*.012:0);
          arm.rotation.z=activeZ+(seatedZ-activeZ)*sitBlend;
        });
        if(dancing)actor.rotation.z=Math.sin(time*5.8+actor.userData.phase)*.08;
      }else if(actor.userData.role==='musician'){
        const beat=time*(musicMood==='ankara'?7.4:5.8)+actor.userData.phase;
        const instrument=actor.userData.instrument;
        if(actor.userData.vocalist){
          const entrance=THREE.MathUtils.smoothstep(time/actor.userData.entranceDuration,0,1);
          actor.position.z=THREE.MathUtils.lerp(-8.12,actor.userData.stageFrontZ,entrance);
          actor.rotation.y=THREE.MathUtils.lerp(.12,0,entrance);
          const singing=Math.sin(beat*1.35);
          const phrase=Math.floor(time/8.5)%4;
          const phraseTime=(time%8.5)/8.5;
          const gesture=phrase===0?Math.max(0,Math.sin(phraseTime*Math.PI*2)):(phrase===1?Math.max(0,Math.sin(phraseTime*Math.PI)):0);
          const crowdCall=phrase===2&&phraseTime>.2&&phraseTime<.82;
          const bandTurn=phrase===3?Math.sin(phraseTime*Math.PI*2)*.22:0;
          actor.userData.body.rotation.z=singing*.035;
          actor.userData.body.rotation.y=bandTurn;
          actor.userData.head.rotation.x=-.08+Math.max(0,singing)*.035;
          actor.userData.head.rotation.y=Math.sin(beat*.42)*.12+bandTurn*.65;
          actor.userData.micInHand.rotation.z=Math.sin(beat*.8)*.08;
          actor.userData.armPivots[0].rotation.z=-.58+Math.sin(beat*.7)*.12;
          actor.userData.armPivots[0].rotation.x=-.18+Math.sin(beat*1.3)*.06;
          actor.userData.armPivots[1].rotation.z=crowdCall?-.82:-.12+gesture*.72;
          actor.userData.armPivots[1].rotation.x=crowdCall?-.38:Math.sin(beat*.8)*.18;
          actor.userData.head.scale.y=1.08+Math.max(0,Math.sin(beat*1.35))*.025;
          if(actor.userData.mouth)actor.userData.mouth.scale.y=.16+Math.max(0,Math.sin(beat*1.35))*.24;
          actor.position.y=Math.max(0,Math.sin(beat*2))*.018;
          return;
        }
        if(actor.userData.body)actor.userData.body.rotation.z=Math.sin(beat)*.018;
        actor.position.y=Math.abs(Math.sin(beat*2))*.012;
        actor.userData.armPivots?.forEach((arm,index)=>{
          const handBeat=instrument==='darbuka'?beat*2:instrument==='keyboard'?beat*2.8:beat*1.35;
          arm.rotation.x=instrument==='darbuka'?Math.sin(handBeat+index*Math.PI)*.28:instrument==='keyboard'?Math.sin(handBeat+index)*.075:instrument==='clarinet'?Math.sin(handBeat+index)*.045:Math.sin(handBeat+index*Math.PI)*.13;
          arm.rotation.z=instrument==='baglama'?(index===0?-.28:.22)+Math.sin(handBeat+index)*.07:instrument==='clarinet'?(index===0?-.32:.18)+Math.sin(handBeat+index)*.045:instrument==='darbuka'?(index===0?-.15:.15)+Math.sin(handBeat+index)*.16:Math.sin(handBeat+index)*.09;
        });
        if(instrument==='baglama'&&actor.userData.instrumentHands?.[0])actor.userData.instrumentHands[0].rotation.x=Math.sin(beat*3.2)*.3;
        if(instrument==='keyboard')actor.userData.instrumentKeys?.forEach((key,index)=>{key.position.y=.985-Math.max(0,Math.sin(beat*3+index*.8))*.018;});
        if(instrument==='darbuka'&&actor.userData.drum)actor.userData.drum.rotation.x=-.18+Math.sin(beat*2)*.035;
        if(instrument==='clarinet')actor.userData.clarinetRings?.forEach((ring,index)=>{ring.scale.setScalar(1+Math.max(0,Math.sin(beat*1.6+index))*.045);});
        // The ensemble briefly acknowledges the vocalist at the end of each musical phrase.
        const phraseTime=time%8.5;
        const bandAcknowledgement=phraseTime>6.35&&phraseTime<7.65;
        const singerLook=bandAcknowledgement?THREE.MathUtils.clamp(-actor.position.x*.12,-.32,.32):0;
        actor.userData.head.rotation.y=Math.sin(beat*.5)*.035+singerLook;
        actor.userData.head.rotation.x=Math.sin(beat*.72)*.018+(bandAcknowledgement?-.025:0);
        if(actor.userData.body)actor.userData.body.rotation.y=bandAcknowledgement?singerLook*.42:Math.sin(beat*.24)*.012;
      }else if(actor.userData.role==='waiter'){
        const serving=actor.userData.motion==='serving';
        const gait=walking?Math.sin(actor.userData.gaitPhase):0;
        actor.position.y=walking?Math.abs(gait)*.022:0;
        actor.rotation.z=walking?gait*.025:0;
        actor.userData.armPivots?.forEach((arm,index)=>{
          arm.rotation.x=serving?(index===1?-.22:0):(walking?gait*.16:Math.sin(time*1.4+index)*.025);
          arm.rotation.z=serving?(index===1?-.16:.08):(walking?(index===0?1:-1)*gait*.16:0);
        });
        actor.userData.legPivots?.forEach((leg,index)=>{leg.rotation.x=walking?Math.sin(actor.userData.gaitPhase+index*Math.PI)*.27:0;});
        if(actor.userData.tray)actor.userData.tray.rotation.z=serving?-.025:(walking?gait*.018:0);
      }else if(actor.userData.motion==='dance'){
        actor.rotation.z=Math.sin(time*7+actor.userData.phase)*.16;
        actor.position.y=Math.abs(Math.sin(time*7+actor.userData.phase))*.08;
      }else{actor.rotation.z=0;actor.position.y=0;}
      const transition=actor.userData.poseFrom;
      if(transition){
        const blend=THREE.MathUtils.smoothstep((time-actor.userData.poseStarted)/.42,0,1);
        const mix=(current,from)=>from+(current-from)*blend;
        actor.rotation.x=mix(actor.rotation.x,transition.root.x);
        actor.rotation.y=mix(actor.rotation.y,transition.root.y);
        actor.rotation.z=mix(actor.rotation.z,transition.root.z);
        actor.position.y=mix(actor.position.y,transition.y);
        const blendPart=(part,from)=>{
          if(!part||!from)return;
          const rotation=from.rotation||from;
          if(!rotation||typeof rotation.x!=='number'||typeof rotation.y!=='number'||typeof rotation.z!=='number')return;
          part.rotation.x=mix(part.rotation.x,rotation.x);
          part.rotation.y=mix(part.rotation.y,rotation.y);
          part.rotation.z=mix(part.rotation.z,rotation.z);
        };
        if(actor.userData.body&&transition.body){
          actor.userData.body.position.y=mix(actor.userData.body.position.y,transition.body.positionY);
          blendPart(actor.userData.body,transition.body);
        }
        if(actor.userData.head&&transition.head){
          actor.userData.head.position.y=mix(actor.userData.head.position.y,transition.head.positionY);
          blendPart(actor.userData.head,transition.head);
        }
        actor.userData.armPivots?.forEach((part,index)=>blendPart(part,transition.arms[index]));
        actor.userData.legPivots?.forEach((part,index)=>blendPart(part,transition.legs[index]));
        if(blend>=1)delete actor.userData.poseFrom;
      }
    });
    updateCamera(dt);
    renderer.render(scene,camera);
  }
  tick();
  return {
    addCustomer,
    resetCamera:()=>setCameraFollow(null),
    followActor:id=>{const actor=actors.get(id);if(!actor)return false;setCameraFollow(actor);return true;},
    setMusicMood:mood=>{musicMood=mood==='ankara'?'ankara':'pavyon';},
    dance:id=>animateActor(id,'dance'),
    seat:id=>animateActor(id,'seat'),
    stage:id=>animateActor(id,'stage'),
    drink:waiterServices.request,
    konsToTable:(k,id)=>{
      const customer=actors.get(id),hostess=actors.get(k);
      if(!customer||!hostess)return false;
      // Evaluate all four approach sides before changing the guest's seat or pose.
      const candidates=[0,Math.PI/2,Math.PI,-Math.PI/2].map(offset=>{
        const point=clampRoomPosition(customer.position.x+Math.sin(offset)*1.25,customer.position.z+Math.cos(offset)*1.25);
        let clearance=Infinity;
        actors.forEach(other=>{
          if(other===hostess||other===customer)return;
          clearance=Math.min(clearance,Math.hypot(point.x-other.position.x,point.z-other.position.z));
        });
        const travel=Math.hypot(point.x-hostess.position.x,point.z-hostess.position.z);
        return {point,score:travel+Math.max(0,1.05-clearance)*3};
      }).sort((a,b)=>a.score-b.score);
      const chosen=candidates.find(item=>item.point.x!==customer.position.x||item.point.z!==customer.position.z);
      if(!chosen)return false;
      prepareGuestForInteraction(customer);
      hostess.userData.motion='flirt';
      hostess.userData.targetRotation=Math.atan2(customer.position.x-chosen.point.x,customer.position.z-chosen.point.z);
      moveTo(k,chosen.point.x,chosen.point.z);
      return true;
    },
    konsDance:(k,id)=>{
      const hostess=actors.get(k),guest=actors.get(id);
      if(!hostess||!guest)return false;
      const slot=interactionReservations.reserveDance(k,id);
      if(!slot)return false;
      prepareGuestForInteraction(guest);
      guest.userData.motion='dance';guest.userData.targetRotation=Math.PI/2;
      hostess.userData.motion='dance';hostess.userData.targetRotation=-Math.PI/2;
      moveTo(id,slot.x-.65,slot.z);moveTo(k,slot.x+.65,slot.z);
      return true;
    },
    vip:(k,id)=>{
      const hostess=actors.get(k),guest=actors.get(id);
      if(!hostess||!guest)return false;
      const slot=interactionReservations.reserveVip(k,id);
      if(!slot)return false;
      prepareGuestForInteraction(guest);
      hostess.userData.motion='flirt';hostess.userData.targetRotation=-Math.PI/2;
      guest.userData.targetRotation=Math.PI/2;
      moveTo(k,slot.x+.55,slot.z);moveTo(id,slot.x-.55,slot.z);
      return true;
    },
    releaseKons:k=>{
      releaseInteractionPair(interactionReservations.releaseDance(k));
      releaseInteractionPair(interactionReservations.releaseVip(k));
      resetKonsHome(k);
    },
    releaseGuest:id=>{
      releaseInteractionPair(interactionReservations.releaseDance(id));
      releaseInteractionPair(interactionReservations.releaseVip(id));
      resetGuestHome(id);
    },
    removeCustomer:id=>{
      const actor=actors.get(id);
      const removed=cleanupCustomerExit({
        customerId:id,
        actor,
        cancelService:customerId=>waiterServices.cancelCustomer(customerId),
        releaseDance:customerId=>releaseInteractionPair(interactionReservations.releaseDance(customerId)),
        releaseVip:customerId=>releaseInteractionPair(interactionReservations.releaseVip(customerId)),
        releaseSeat:customer=>releaseSeat(customer),
        detach:customer=>actorGroup.remove(customer),
        forget:customerId=>actors.delete(customerId),
        dispose:customer=>disposeSceneResources(customer)
      });
      updateCrowdQuality();
      return removed;
    },
    show:id=>animateActor(id,'stage'),
    getTableStatus:()=>tableStates.map(table=>({id:table.id,occupied:table.occupied,capacity:table.seats.length})),
    setLikes:value=>{redGlow.intensity=35+Math.min(value,500)*.08;goldGlow.intensity=28+Math.min(value,500)*.04;},
    dispose:()=>{if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();waiterServices.dispose();interactionReservations.clear();disposeSceneResources(scene);renderer.renderLists.dispose();renderer.dispose();}
  };
}
