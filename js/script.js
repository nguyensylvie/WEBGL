import * as THREE from '../vendor/three.js-master/build/three.module.js';
import Stats from '../vendor/three.js-master/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../vendor/three.js-master/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../vendor/three.js-master/examples/jsm/loaders/FBXLoader.js';

const Scene = {
	vars: {
		container: null,
		scene: null,
		renderer: null,
		camera: null,
		stats: null,
		controls: null,
		texture: null,
		mouse: new THREE.Vector2(),
		raycaster: new THREE.Raycaster(),
		animSpeed: null,
		animPercent: 0.00,
		text: "DAWIN",
		//objHidden: false
	},
	animate: () => {		
		requestAnimationFrame(Scene.animate);
		Scene.vars.raycaster.setFromCamera(Scene.vars.mouse, Scene.vars.camera);

		Scene.customAnimation();

		if (Scene.vars.group !== undefined) {
			let intersects = Scene.vars.raycaster.intersectObjects(Scene.vars.group.children, true);

			if (intersects.length > 0) {
				Scene.vars.animSpeed = 0.05;
			} else {
				Scene.vars.animSpeed = -0.05;
			}
		}

		//Pour la montgolfiere

		// if (Scene.vars.group1 !== undefined) {
		// 	let intersects1 = Scene.vars.raycaster.intersectObjects(Scene.vars.group1.children, true);

		// 	if (intersects1.length > 0) {
		// 		Scene.vars.animSpeed = 0.07;
		// 	} else {
		// 		Scene.vars.animSpeed = -0.07;
		// 	}
		// }

		Scene.render();
	},
	render: () => {
		// Animer la sphère lava (ne fonctionne pas aussi dans la méthode animate)

		// requestAnimationFrame(Scene.render);
		// lava.rotation.x += 0.01;
		// lava.rotation.y += 0.02;
		Scene.vars.renderer.render(Scene.vars.scene, Scene.vars.camera);
		Scene.vars.stats.update();
	},
	customAnimation: () => {
		let vars = Scene.vars;

		if (vars.animSpeed === null) {
			return;
		}

		vars.animPercent = vars.animPercent + vars.animSpeed;

		if (vars.animPercent < 0) {
			vars.animPercent = 0;
			return;
		}
		if (vars.animPercent > 1) {
			vars.animPercent = 1;
			return;
		}

		//Anime les pommes qui tombent
		if (vars.animPercent >= 0.20 && vars.animPercent <= 0.55) {
			let percent =  (vars.animPercent - 0.2) / 0.55;
			vars.apple2.position.y = 5 * percent;
			vars.apple3.position.y = 35 * percent;
			vars.apple4.position.y = 35 * percent;
			vars.apple5.position.y = 25 * percent;
		} else if (vars.animPercent < 0.20) {
			vars.apple2.position.y = 200;
			vars.apple3.position.y = 150;
			vars.apple4.position.y = 180;
			vars.apple5.position.y = 165;
		}

		//Anime montgolfiere qui vole
		
		// if (vars.animPercent >= 0.40) {
		// 	let percent = (vars.animPercent - 0.4) / 0.6;
		// 	vars.airBalloon.position.y = 50 * percent;
		// } else if (vars.animPercent < 0.70) {
		// 	vars.airBalloon.position.y = 0;
		// }
	},
	loadFBX: (file, scale, position, rotation, color, namespace, callback) => {
		let loader = new FBXLoader();

		if (file === undefined) {
			return;
		}

		loader.load('./fbx/' + file, (object) => {

			object.traverse((child) => {
				if (child.isMesh) {

					child.castShadow = true;
					child.receiveShadow = true;

					if (namespace === "plaquette") {
						child.material = new THREE.MeshBasicMaterial({
							map: Scene.vars.texture
						});
					}

					if (namespace === "deer") {
						child.material = new THREE.MeshStandardMaterial({
							color: new THREE.Color(color),
							roughness: .3,
							metalness: .6
						})
					}

					child.material.color = new THREE.Color(color);
				}
			});

			object.position.x = position[0];
			object.position.y = position[1];
			object.position.z = position[2];

			object.rotation.x = rotation[0];
			object.rotation.y = rotation[1];
			object.rotation.z = rotation[2];

			object.scale.x = object.scale.y = object.scale.z = scale;
			Scene.vars[namespace] = object;

			callback();
		});
		
	},
	loadText: (text, scale, position, rotation, color, namespace, callback) => {
		let loader = new THREE.FontLoader();

		if (text === undefined || text === "") {
			return;
		}

		loader.load('./vendor/three.js-master/examples/fonts/helvetiker_regular.typeface.json', (font) => {
			let geometry = new THREE.TextGeometry(text, {
				font,
				size: 1,
				height: 0.1,
				curveSegments: 1,
				bevelEnabled: false
			});

			geometry.computeBoundingBox();
			let offset = geometry.boundingBox.getCenter().negate();
			geometry.translate(offset.x, offset.y, offset.z);

			let material = new THREE.MeshBasicMaterial({
				color: new THREE.Color(color)
			});

			let mesh = new THREE.Mesh(geometry, material);

			mesh.position.x = position[0];
			mesh.position.y = position[1];
			mesh.position.z = position[2];

			mesh.rotation.x = rotation[0];
			mesh.rotation.y = rotation[1];
			mesh.rotation.z = rotation[2];

			mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

			Scene.vars[namespace] = mesh;

			callback();
		});
	},
	onWindowResize: () => {
		let vars = Scene.vars;
		vars.camera.aspect = window.innerWidth / window.innerHeight;
		vars.camera.updateProjectionMatrix();
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	onMouseMove: (event) => {
		Scene.vars.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		Scene.vars.mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	},
	keyDown: (event) => {
		const nameTouch = event.key;
	  
		if (nameTouch === 'Enter') {
			alert("Bienvenue");
		  return;
		}
	},
	//Méthode1 permettant de cacher l'objet bronze (cerf, plaquette..)

	keyUp: (event) => {
		const nomTouche = event.key;
	  
		// Dès que l'utilisateur relâche la touche Ctrl, la touche n'est plus active.
		// Aussi event.ctrlKey est false.
		if (nomTouche === 'Control') {
			alert('Le cerf a disparu !');
			bronze.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
					child.visible = false;
				}
			});
		}
	},
	//Méthode2 permettant de cacher l'objet bronze (cerf, plaquette..)

	// buttonHide: () => {
	// 	if(objHidden) {
	// 		objHidden = true;
	// 		bronze.visible = false;
	// 		alert('Le cerf a disparu !');
	// 	} else {
	// 		objHidden = false;
	// 		bronze.visible = true;
	// 	}
	// },
	init: () => {
		let vars = Scene.vars;

		// Préparer le container pour la scène
		vars.container = document.createElement('div');
		vars.container.classList.add('fullscreen');
		document.body.appendChild(vars.container);

		// ajout de la scène
		vars.scene = new THREE.Scene();
		vars.scene.background = new THREE.Color(0xFBD1FC);
		vars.scene.fog = new THREE.Fog(vars.scene.background, 200, 2000);

		// paramétrage du moteur de rendu
		vars.renderer = new THREE.WebGLRenderer({ antialias: true });
		vars.renderer.setPixelRatio(window.devicePixelRatio);
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
		
		vars.renderer.shadowMap.enabled = true;
		vars.renderer.shadowMapSoft = true;

		vars.container.appendChild(vars.renderer.domElement);

		// ajout de la caméra
		vars.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
		vars.camera.position.z = (-1.5, 210, 572);
		vars.camera.position.y = 100;

		// ajout de la lumière
		const lightIntensityHemisphere = .5;
		let light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, lightIntensityHemisphere);
		light.position.set(0, 700, 0);
		vars.scene.add(light);

		// ajout des directionelles
		const lightIntensity = .8;
		const d = 1000;
		let light1 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light1.position.set(0, 700, 0);
		light1.castShadow = true;
		light1.shadow.camera.left = -d;
		light1.shadow.camera.right = d;
		light1.shadow.camera.top = d;
		light1.shadow.camera.bottom = -d;
		light1.shadow.camera.far = 2000;
		light1.shadow.mapSize.width = 4096;
		light1.shadow.mapSize.height = 4096;
		vars.scene.add(light1);

		let light2 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light2.position.set(-400, 200, 400);
		light2.castShadow = true;
		light2.shadow.camera.left = -d;
		light2.shadow.camera.right = d;
		light2.shadow.camera.top = d;
		light2.shadow.camera.bottom = -d;
		light2.shadow.camera.far = 2000;
		light2.shadow.mapSize.width = 4096;
		light2.shadow.mapSize.height = 4096;
		vars.scene.add(light2);

		let light3 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light3.position.set(400, 200, 400);
		light3.castShadow = true;
		light3.shadow.camera.left = -d;
		light3.shadow.camera.right = d;
		light3.shadow.camera.top = d;
		light3.shadow.camera.bottom = -d;
		light3.shadow.camera.far = 2000;
		light3.shadow.mapSize.width = 4096;
		light3.shadow.mapSize.height = 4096;
		vars.scene.add(light3);

		// ajout du sol
		let mesh = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(2000, 2000),
			new THREE.MeshLambertMaterial(
				{ color: new THREE.Color(0x5B820C),
				  map: new THREE.ImageUtils.loadTexture('/texture/grass.jpg') }
			)
		);
		mesh.rotation.x = -Math.PI / 2;
		mesh.receiveShadow = false;
		vars.scene.add(mesh);

		let planeMaterial = new THREE.ShadowMaterial();
		planeMaterial.opacity = 0.07;
		let shadowPlane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(2000, 2000),
			planeMaterial);
		shadowPlane.rotation.x = -Math.PI / 2;
		shadowPlane.receiveShadow = true;

		vars.scene.add(shadowPlane);

		// ajout de la sphère
		let geometry = new THREE.SphereGeometry(1000, 32, 32);
		let material = new THREE.MeshPhongMaterial({map: new THREE.ImageUtils.loadTexture('/texture/sky.jpg')});
		material.side = THREE.DoubleSide;
		let sphere = new THREE.Mesh(geometry, material);
		vars.scene.add(sphere);

		// ajout de la sphere lava
		var geometry1 = new THREE.SphereGeometry(150, 25, 32);
		var material1 = new THREE.MeshBasicMaterial({map: new THREE.ImageUtils.loadTexture('/texture/lava.jpg'), overdraw: true});
		let lava = new THREE.Mesh(geometry1, material1);
		lava.position.set(200, 450, -1000);
		vars.scene.add(lava);

		vars.texture = new THREE.TextureLoader().load('./texture/marbre.jpg');

		let hash = document.location.hash.substr(1);
		if (hash.length !== 0) {
			let text = hash.substring();
			Scene.vars.text = decodeURI(text);
		}

		// ajout objet arbre et pommes
		Scene.loadFBX("Tree low.FBX", 2, [0, 0, 20], [0, 0, 0], 0xFFD700, "tree", () => {
			Scene.loadFBX("apple.FBX", 0.1, [0, 10, 0], [0, 0, 20], 0xF10202, "apple", () => {
				let vars = Scene.vars;

				let trees = new THREE.Group();
				trees.add(vars.tree);
				trees.add(vars.apple);

				trees.position.set(200, 0, 0);
				trees.rotation.y = -Math.PI / 4;
				trees.children[0].traverse(node => {
					if (node.isMesh) {
						node.material = new THREE.MeshStandardMaterial({
							color: new THREE.Color(0x9EDD20),
							metalness: .2,
							roughness: .3
						})
					}
				});

				let apple2 = vars.apple.clone();
				apple2.rotation.z = 45;
				apple2.position.x = 15;
				apple2.position.y = 200;
				apple2.position.z = 95;
				vars.apple2 = apple2;
				trees.add(apple2);

				let apple3 = vars.apple.clone();
				apple3.rotation.z = 15;
				apple3.position.x = 55;
				apple3.position.y = 150;
				apple3.position.z = 30;
				vars.apple3 = apple3;
				trees.add(apple3);

				let apple4 = vars.apple.clone();
				apple4.rotation.z = 35;
				apple4.position.x = -40;
				apple4.position.y = 180;
				apple4.position.z = -30;
				vars.apple4 = apple4;
				trees.add(apple4);
				
				let apple5 = vars.apple.clone();
				apple5.rotation.z = 90;
				apple5.position.x = -30;
				apple5.position.y = 165;
				apple5.position.z = 85;
				vars.apple5 = apple5;
				trees.add(apple5);

				vars.scene.add(trees);
				vars.group = trees;
			});
		});

		// ajout objet montgolfiere
		Scene.loadFBX("Air_Balloon.FBX", 0.1, [0, 0, 0], [0, 0, 0], 0xFABB3E, "balloon", () => {
			let vars = Scene.vars;

			let airBalloon = new THREE.Group();
			airBalloon.position.set(-400, 250, -700);
			airBalloon.add(vars.balloon);
			airBalloon.traverse(node => {
			if (node.isMesh) {
				node.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(0xFABB3E),
					metalness: .2,
					roughness: .3
				})
			}
			});
			vars.scene.add(airBalloon);
			vars.group1 = airBalloon;
		});
		
		// objet cerf et support
		Scene.loadFBX("Logo_Feelity.FBX", 10, [45, 22, 0], [0, 0, 0], 0xFFFFFF, 'logo', () => {
			Scene.loadFBX("deer.FBX", 0.1, [1, 60, 10], [0, 50, 45.5], 0x694D15, 'deer', () => {
				Scene.loadFBX("Socle_Partie1.FBX", 10, [0, 0, 0], [0, 0, 0], 0x1A1A1A, 'socle1', () => {
					Scene.loadFBX("Socle_Partie2.FBX", 10, [0, 0, 0], [0, 0, 0], 0x1A1A1A, 'socle2', () => {
						Scene.loadFBX("Plaquette.FBX", 10, [0, 4, 45], [0, 0, 0], 0xFFFFFF, 'plaquette', () => {
							Scene.loadText(Scene.vars.text, 10, [0, 23, 52], [0, 0, 0], 0x1A1A1A, "texte", () => {
								
								let vars = Scene.vars;
								
								let bronze = new THREE.Group();
								bronze.add(vars.socle1);
								bronze.add(vars.socle2);
								bronze.add(vars.deer);
								bronze.add(vars.logo);
								bronze.add(vars.texte);
								bronze.add(vars.plaquette);

								let logo2 = vars.logo.clone();
								logo2.rotation.z = Math.PI;
								logo2.position.x = -45;
								vars.logo2 = logo2;
								bronze.add(logo2);
								bronze.position.z = -50;
								bronze.position.y = 10;
								vars.scene.add(bronze);
								vars.bronze = bronze;
								
								//bronze.visible = true;

								let elem = document.querySelector('#loading');
								elem.parentNode.removeChild(elem);
							});
						});
					});
				});
			});
		});
		
		// ajout des controles
		vars.controls = new OrbitControls(vars.camera, vars.renderer.domElement);
		vars.controls.minDistance = 400;
		vars.controls.maxDistance = 900;
		vars.controls.minPolarAngle = Math.PI / 4;
		vars.controls.maxPolarAngle = Math.PI / 2;
		vars.controls.minAzimuthAngle = - Math.PI / 4;
		vars.controls.target.set(0, 100, 0);
		vars.controls.update();

		window.addEventListener('resize', Scene.onWindowResize, false);
		window.addEventListener('mousemove', Scene.onMouseMove, false);

		window.addEventListener('keydown', Scene.keyDown, false);
		window.addEventListener('keyup',Scene.keyUp, false);

		//window.getElementById('hideShow').addEventListener('click', Scene.buttonHide, false);

		vars.stats = new Stats();
		vars.container.appendChild(vars.stats.dom);

		Scene.animate();
	}
};

Scene.init();