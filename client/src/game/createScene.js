import * as THREE from 'three';

export function createGame(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
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
  key.position.set(-7, 14, 8); key.castShadow = true; key.shadow.mapSize.set(1024,1024); scene.add(key);
  const redGlow = new THREE.PointLight('#e33368', 35, 22); redGlow.position.set(-6,4,-3); scene.add(redGlow);
  const goldGlow = new THREE.PointLight('#ffc66d', 28, 20); goldGlow.position.set(7,4,2); scene.add(goldGlow);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26,22),new THREE.MeshStandardMaterial({color:'#301c2c',roughness:.78}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const border = new THREE.Mesh(new THREE.BoxGeometry(26.3,.35,22.3),new THREE.MeshStandardMaterial({color:'#b17a45',metalness:.65,roughness:.3}));
  border.position.y=-.28;scene.add(border);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshStandardMaterial({color:'#751d3d',roughness:.95}));
  carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.015,1);scene.add(carpet);

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
  box('bar',-10,.65,-5,2.2,1.3,5,'#5a2b3c');label('SERVİS',-10,-5);
  box('vip-wall',9,.6,-7,.25,1.2,5,'#bc8d50',.7);
  box('vip-floor',8,.05,-4,5,.1,5,'#48233b');label('VIP LOCA',8,-4);
  label('DANS PİSTİ',0,1,'#f4d4a5');

  const tablePositions=[[-7,3],[-3,6],[4,6],[8,2],[-8,-1],[4,-1]];
  tablePositions.forEach(([x,z],i)=>{
    const table=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.18,24),new THREE.MeshStandardMaterial({color:'#6e3d36',metalness:.35,roughness:.35}));
    table.position.set(x,.9,z);table.castShadow=true;scene.add(table);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(.83,.83,.06,24),new THREE.MeshStandardMaterial({color:'#d0a260',metalness:.72,roughness:.28}));
    top.position.set(x,1.02,z);scene.add(top);
    for(let j=0;j<3;j++){const a=j*Math.PI*2/3;const seat=new THREE.Mesh(new THREE.BoxGeometry(.9,.65,.75),new THREE.MeshStandardMaterial({color:'#8c2545',roughness:.8}));seat.position.set(x+Math.cos(a)*1.45,.35,z+Math.sin(a)*1.45);seat.rotation.y=-a;seat.castShadow=true;scene.add(seat);}
    label('MASA '+(i+1),x,z+1.8,'#e8c78e');
  });
  for(let i=0;i<7;i++){const post=box('gold-post',-11+i*3.65,2,-10.5,.09,4,.09,'#b9864c',.8);post.castShadow=false;}

  const actorGroup=new THREE.Group();scene.add(actorGroup);
  const actors=new Map();
  const konsHomes=new Map();
  const waiterHomes=new Map();
  const waiterBusy=new Set();
  const konsColors=['#a92f59','#692b62','#bd7544','#345e77','#8d3b45','#75539a','#b08a36','#3f786a','#934c70','#5c4a37'];
  const colors=['#4b9a8c','#c28b48','#5572a8','#a84e6b','#77914d','#8967a6','#cf7950'];
  function makeActor(id,role='customer',variant=0){
    const group=new THREE.Group();group.userData={id,role,target:null,phase:Math.random()*6,motion:'idle'};
    const color=role==='kons'?konsColors[variant%konsColors.length]:role==='waiter'?'#e7dfd3':colors[variant%colors.length];
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.68,3,7),new THREE.MeshStandardMaterial({color,roughness:.75}));
    body.position.y=.72;body.castShadow=true;group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.23,12,10),new THREE.MeshStandardMaterial({color:'#d9a783',roughness:.85}));
    head.position.y=1.35;head.castShadow=true;group.add(head);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.24,10,7,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:role==='kons'?'#241622':'#28212a'}));
    hair.position.set(0,1.42,0);group.add(hair);
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.045,12),new THREE.MeshStandardMaterial({color:role==='kons'?'#e3bd76':'#8f6b7b',metalness:.55}));
    ring.position.y=.04;group.add(ring);
    group.position.set((Math.random()-.5)*14,0,(Math.random()-.5)*10);
    actorGroup.add(group);actors.set(id,group);return group;
  }
  function moveTo(id,x,z){const actor=actors.get(id);if(actor)actor.userData.target=new THREE.Vector3(x,0,z);}
  function addCustomer(viewer){
    const actor=makeActor(viewer.id,'customer');actor.userData.name=viewer.name;
    moveTo(viewer.id,(Math.random()-.5)*12,(Math.random()-.5)*7);
  }
  function animateActor(id,kind){
    const actor=actors.get(id);if(!actor)return;
    const targets={dance:[(Math.random()-.5)*4,1],stage:[0,-8.5],seat:[-7+Math.random()*15,5]};
    const target=targets[kind]||targets.dance;moveTo(id,target[0],target[1]);actor.userData.motion=kind;
  }
  for(let i=1;i<=3;i++){
    const id='kons-'+i;const actor=makeActor(id,'kons');
    actor.position.set(-5+i*5,0,-2);actor.userData.home=actor.position.clone();konsHomes.set(id,actor.position.clone());
  }
  for(let i=1;i<=2;i++){
    const id='waiter-'+i;const actor=makeActor(id,'waiter');
    actor.position.set(-9+i*1.2,0,-4);actor.userData.home=actor.position.clone();
  }

  const clock=new THREE.Clock();
  function resize(){
    const width=canvas.clientWidth||window.innerWidth,height=canvas.clientHeight||window.innerHeight;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    // Portrait screens need a wider view of the whole room.
    camera.fov=width<700?48:38;camera.position.set(0,width<700?27:22,width<700?31:25);
    camera.updateProjectionMatrix();camera.lookAt(0,0,0);
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  let raf=0;
  function tick(){
    raf=requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05),time=clock.elapsedTime;
    actors.forEach(actor=>{
      const target=actor.userData.target;
      if(target){
        const dx=target.x-actor.position.x,dz=target.z-actor.position.z,distance=Math.hypot(dx,dz);
        if(distance>.08){actor.position.x+=dx/distance*Math.min(distance,dt*2.4);actor.position.z+=dz/distance*Math.min(distance,dt*2.4);actor.rotation.y=Math.atan2(dx,dz);}
        else actor.userData.target=null;
      }
      if(actor.userData.motion==='dance'){
        actor.rotation.z=Math.sin(time*7+actor.userData.phase)*.16;
        actor.position.y=Math.abs(Math.sin(time*7+actor.userData.phase))*.08;
      }else{actor.rotation.z=0;actor.position.y=0;}
    });
    renderer.render(scene,camera);
  }
  tick();
  return {
    addCustomer,
    dance:id=>animateActor(id,'dance'),
    seat:id=>animateActor(id,'seat'),
    stage:id=>animateActor(id,'stage'),
    drink:(customerId)=>{const customer=actors.get(customerId);if(!customer)return;const waiterId=[...waiterHomes.keys()].find(id=>!waiterBusy.has(id));if(!waiterId)return;waiterBusy.add(waiterId);moveTo(waiterId,customer.position.x-1.1,customer.position.z);window.setTimeout(()=>{const home=waiterHomes.get(waiterId);if(home)moveTo(waiterId,home.x,home.z);waiterBusy.delete(waiterId);},4500);},
    konsToTable:(k,id)=>{const customer=actors.get(id);if(customer)moveTo(k,customer.position.x+1.2,customer.position.z);},
    konsDance:(k,id)=>{animateActor(k,'dance');animateActor(id,'dance');},
    vip:(k,id)=>{moveTo(k,8,-4);moveTo(id,7,-4);},
    releaseKons:k=>{const home=konsHomes.get(k);if(home){moveTo(k,home.x,home.z);const actor=actors.get(k);if(actor)actor.userData.motion='idle';}},
    show:id=>animateActor(id,'stage'),
    setLikes:value=>{redGlow.intensity=35+Math.min(value,500)*.08;goldGlow.intensity=28+Math.min(value,500)*.04;},
    dispose:()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.dispose();}
  };
}
