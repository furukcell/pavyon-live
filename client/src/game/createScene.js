import * as THREE from 'three';
import { getCustomerAppearanceByIndex } from './characterCatalog.js';

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
  const seatSpots=[];
  tablePositions.forEach(([x,z],i)=>{
    const table=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.18,24),new THREE.MeshStandardMaterial({color:'#6e3d36',metalness:.35,roughness:.35}));
    table.position.set(x,.9,z);table.castShadow=true;scene.add(table);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(.83,.83,.06,24),new THREE.MeshStandardMaterial({color:'#d0a260',metalness:.72,roughness:.28}));
    top.position.set(x,1.02,z);scene.add(top);
    for(let j=0;j<3;j++){const a=j*Math.PI*2/3;const sx=x+Math.cos(a)*1.45,sz=z+Math.sin(a)*1.45;const seat=new THREE.Mesh(new THREE.BoxGeometry(.9,.65,.75),new THREE.MeshStandardMaterial({color:'#8c2545',roughness:.8}));seat.position.set(sx,.35,sz);seat.rotation.y=-a;seat.castShadow=true;scene.add(seat);seatSpots.push({x:sx,z:sz,rotation:-a,occupied:false});}
    label('MASA '+(i+1),x,z+1.8,'#e8c78e');
  });
  for(let i=0;i<7;i++){const post=box('gold-post',-11+i*3.65,2,-10.5,.09,4,.09,'#b9864c',.8);post.castShadow=false;}

  const actorGroup=new THREE.Group();scene.add(actorGroup);
  const actors=new Map();
  let customerSequence=0;
  const konsHomes=new Map();
  const waiterHomes=new Map();
  const waiterBusy=new Set();
  const konsColors=['#a92f59','#692b62','#bd7544','#345e77','#8d3b45','#75539a','#b08a36','#3f786a','#934c70','#5c4a37'];
  const skinTones=['#e8bd9b','#d6a17e','#b97855','#f0c9a8','#986447','#c88d6d'];
  const hairTones=['#211b22','#38251e','#6c4930','#171820','#7b5a3c'];
  const colors=['#4b9a8c','#c28b48','#5572a8','#a84e6b','#77914d','#8967a6','#cf7950'];
  function makeActor(id,role='customer',variant=0){
    const group=new THREE.Group();
    const appearance=getCustomerAppearanceByIndex(role==='kons'?variant*2+1:variant);
    group.userData={id,role,target:null,phase:Math.random()*6,motion:'idle',flirtPhase:Math.random()*Math.PI*2};
    const generatedColor=role==='customer'?appearance.outfit:new THREE.Color().setHSL((variant*0.137)%1,.34,.43);
    const color=role==='kons'?konsColors[variant%konsColors.length]:role==='waiter'?'#e7dfd3':generatedColor;
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(role==='kons'?.235:.26+(variant%4)*.012,role==='kons'?.58:.64+(variant%3)*.045,3,7),new THREE.MeshStandardMaterial({color,roughness:.48,metalness:role==='kons'?.12:0}));
    body.position.y=.72;body.castShadow=true;group.add(body);
    const skin=role==='waiter'?'#d6ad8c':appearance.skin;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.22+(variant%3)*.012,12,10),new THREE.MeshStandardMaterial({color:skin,roughness:.85}));
    head.position.y=1.35;head.castShadow=true;group.add(head);
    const hairColor=role==='waiter'?'#28212a':appearance.hair;
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.23+(variant%5)*.008,10,7,0,Math.PI*2,0,Math.PI*(.48+(variant%4)*.08)),new THREE.MeshStandardMaterial({color:hairColor}));
    hair.position.set(0,1.42,0);group.add(hair);
    if(role==='kons'&&['long','wavy','curly','ponytail'].includes(appearance.haircut)){
      const backHair=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshStandardMaterial({color:hairColor}));
      backHair.scale.set(.9,1.75,.78);backHair.position.set(0,1.02,-.12);group.add(backHair);
    }
    if(role==='kons'){
      const limbMaterial=new THREE.MeshStandardMaterial({color:skin,roughness:.82});
      const armPivots=[];
      const legPivots=[];
      for(const side of [-1,1]){
        const armPivot=new THREE.Group();
        armPivot.position.set(side*.29,1.02,0);
        const upperArm=new THREE.Mesh(new THREE.CapsuleGeometry(.065,.28,3,7),limbMaterial);
        upperArm.position.y=-.2;upperArm.castShadow=true;armPivot.add(upperArm);
        const hand=new THREE.Mesh(new THREE.SphereGeometry(.07,8,7),limbMaterial);
        hand.position.y=-.39;armPivot.add(hand);
        group.add(armPivot);armPivots.push(armPivot);
        const legPivot=new THREE.Group();
        legPivot.position.set(side*.13,.38,0);
        const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.34,3,7),limbMaterial);
        leg.position.y=-.2;leg.castShadow=true;legPivot.add(leg);
        group.add(legPivot);legPivots.push(legPivot);
      }
      group.userData.armPivots=armPivots;
      group.userData.legPivots=legPivots;
      const dress=new THREE.Mesh(new THREE.CylinderGeometry(.19,.39,.42,12,1,true),new THREE.MeshStandardMaterial({color:appearance.outfit,metalness:.28,roughness:.32,side:THREE.DoubleSide}));
      dress.position.y=.43;dress.castShadow=true;group.add(dress);
      const belt=new THREE.Mesh(new THREE.CylinderGeometry(.245,.245,.045,16),new THREE.MeshStandardMaterial({color:'#e7bd79',metalness:.8,roughness:.22}));
      belt.position.y=.57;group.add(belt);
      for(const side of [-1,1]){
        const strap=new THREE.Mesh(new THREE.BoxGeometry(.045,.28,.045),new THREE.MeshStandardMaterial({color:'#e7bd79',metalness:.65}));
        strap.position.set(side*.13,1.03,.015);strap.rotation.z=side*.13;group.add(strap);
        const heel=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.28),new THREE.MeshStandardMaterial({color:'#1b101b',metalness:.3,roughness:.3}));
        heel.position.set(side*.13,.08,.02);group.add(heel);
        const eye=new THREE.Mesh(new THREE.SphereGeometry(.025,8,8),new THREE.MeshBasicMaterial({color:'#24131c'}));
        eye.position.set(side*.075,1.36,.195);group.add(eye);
      }
      const smileCurve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.055,1.25,.205),new THREE.Vector3(0,1.22,.23),new THREE.Vector3(.055,1.25,.205));
      const smile=new THREE.Mesh(new THREE.TubeGeometry(smileCurve,8,.012,5,false),new THREE.MeshBasicMaterial({color:'#7e263c'}));
      smile.name='kons-smile';group.add(smile);
      const laughMouth=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:'#4a1428'}));
      laughMouth.name='kons-laugh-mouth';laughMouth.scale.set(1,.08,.35);laughMouth.position.set(0,1.235,.205);group.add(laughMouth);
      const earring=new THREE.Mesh(new THREE.TorusGeometry(.035,.009,5,10),new THREE.MeshStandardMaterial({color:'#e8c27e',metalness:.8}));
      earring.position.set(.22,1.2,.01);group.add(earring);
    }
    const ring=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.045,12),new THREE.MeshStandardMaterial({color:role==='kons'?'#e3bd76':'#8f6b7b',metalness:.55}));
    ring.position.y=.04;group.add(ring);
    group.position.set((Math.random()-.5)*14,0,(Math.random()-.5)*10);
    actorGroup.add(group);actors.set(id,group);return group;
  }
  function moveTo(id,x,z){const actor=actors.get(id);if(actor)actor.userData.target=new THREE.Vector3(x,0,z);}
  function addCustomer(viewer){
    const variant=customerSequence++;
    const actor=makeActor(viewer.id,'customer',variant);actor.userData.name=viewer.name;
    actor.position.set((Math.random()-.5)*14,0,(Math.random()-.5)*11);
    actor.userData.home=actor.position.clone();
  }
  function releaseSeat(actor){if(actor.userData.seat){actor.userData.seat.occupied=false;actor.userData.seat=null;}}
  function seatCustomer(id){
    const actor=actors.get(id);if(!actor)return;
    releaseSeat(actor);
    const spot=seatSpots.find(item=>!item.occupied);
    if(!spot){moveTo(id,(Math.random()-.5)*12,(Math.random()-.5)*8);return;}
    spot.occupied=true;actor.userData.seat=spot;actor.userData.motion='idle';actor.userData.targetRotation=spot.rotation;
    moveTo(id,spot.x,spot.z);
  }
  function animateActor(id,kind){
    const actor=actors.get(id);if(!actor)return;
    if(kind==='seat'){seatCustomer(id);return;}
    releaseSeat(actor);
    const targets={dance:[(Math.random()-.5)*4,1],stage:[0,-8.5]};
    const target=targets[kind]||targets.dance;moveTo(id,target[0],target[1]);actor.userData.motion=kind;
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
        else {actor.userData.target=null;if(actor.userData.targetRotation!==undefined){actor.rotation.y=actor.userData.targetRotation;delete actor.userData.targetRotation;}}
      }
      if(actor.userData.role==='kons'){
        const flirt=Math.sin(time*1.7+actor.userData.flirtPhase);
        actor.rotation.z=(actor.userData.motion==='dance'?Math.sin(time*7+actor.userData.phase)*.18:flirt*.035);
        actor.position.y=actor.userData.motion==='dance'?Math.abs(Math.sin(time*7+actor.userData.phase))*.08:Math.max(0,flirt)*.018;
        const smile=actor.getObjectByName('kons-smile');
        const laughMouth=actor.getObjectByName('kons-laugh-mouth');
        const dancing=actor.userData.motion==='dance';
        actor.userData.armPivots?.forEach((arm,index)=>{
          const side=index===0?-1:1;
          arm.rotation.z=dancing?side*(.75+Math.sin(time*8+index)*.28):side*(.16+Math.sin(time*1.8+actor.userData.flirtPhase+index)*.12);
          arm.rotation.x=dancing?Math.sin(time*5+index)*.18:Math.sin(time*1.3+index)*.06;
        });
        actor.userData.legPivots?.forEach((leg,index)=>{
          leg.rotation.x=dancing?Math.sin(time*8+index*Math.PI)*.32:Math.sin(time*1.4+index)*.025;
        });
        const laughing=actor.userData.motion==='laugh'||(Math.sin(time*.72+actor.userData.flirtPhase*2)>.985);
        if(smile)smile.scale.y=laughing?.45:1+Math.max(0,flirt)*.25;
        if(laughMouth){laughMouth.scale.y=laughing?1:.08;}
        if(laughing)actor.position.y+=Math.abs(Math.sin(time*10+actor.userData.phase))*.025;
      }else if(actor.userData.motion==='dance'){
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
    konsToTable:(k,id)=>{const customer=actors.get(id);if(customer){const hostess=actors.get(k);if(hostess)hostess.userData.motion='flirt';moveTo(k,customer.position.x+1.2,customer.position.z);}},
    konsDance:(k,id)=>{const hostess=actors.get(k);if(hostess)hostess.userData.motion='dance';animateActor(id,'dance');},
    vip:(k,id)=>{const hostess=actors.get(k);if(hostess)hostess.userData.motion='flirt';moveTo(k,8,-4);moveTo(id,7,-4);},
    releaseKons:k=>{const home=konsHomes.get(k);if(home){moveTo(k,home.x,home.z);const actor=actors.get(k);if(actor)actor.userData.motion='idle';}},
    releaseGuest:id=>{const actor=actors.get(id);if(actor){releaseSeat(actor);actor.userData.motion='idle';const home=actor.userData.home;if(home)moveTo(id,home.x,home.z);}},
    show:id=>animateActor(id,'stage'),
    setLikes:value=>{redGlow.intensity=35+Math.min(value,500)*.08;goldGlow.intensity=28+Math.min(value,500)*.04;},
    dispose:()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.dispose();}
  };
}
