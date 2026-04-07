import Globe from 'globe.gl';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FaPlayCircle } from 'react-icons/fa';
import { useRouter } from '../../../core/hooks/useRouter';

export default function HeroLanding() {
  const myGlobe = Globe();
  const globeRef = useRef<HTMLDivElement>(null);
  const [globeRefState, setGlobeRefState] = useState<HTMLDivElement>(
    globeRef.current ?? document.createElement('div')
  );

  const router = useRouter();

  useEffect(() => {
    setGlobeRefState(globeRef.current ?? document.createElement('div'));
  }, [globeRef.current]);

  const N = 300;
  type GlobeData = {
    lat: number;
    lng: number;
    alt: number;
    radius: number;
    color: string;
  };

  const gData: GlobeData[] = [...Array(N).keys()].map(() => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    alt: Math.random() * 0.3 + 0.1,
    radius: Math.random() * 5,
    color: ['white'][Math.round(Math.random() * 3)],
  }));

  const textures = [
    new THREE.TextureLoader().load('assets/globe/eur.png'),
    new THREE.TextureLoader().load('assets/globe/usd.png'),
    new THREE.TextureLoader().load('assets/globe/jpy.png'),
    new THREE.TextureLoader().load('assets/globe/gbp.png'),
    new THREE.TextureLoader().load('assets/globe/github.png'),
    new THREE.TextureLoader().load('assets/globe/microsoft.jpg'),
    new THREE.TextureLoader().load('assets/globe/zoom.jpg'),
    new THREE.TextureLoader().load('assets/globe/overleaf.jpg'),
    new THREE.TextureLoader().load('assets/globe/slack.jpg'),
    new THREE.TextureLoader().load('assets/globe/jira.jpeg'),
    new THREE.TextureLoader().load('assets/globe/canva.jpeg'),
    new THREE.TextureLoader().load('assets/globe/salesforce.jpg'),
    new THREE.TextureLoader().load('assets/globe/postman.jpg')
  ];

  myGlobe(globeRefState)
    .globeImageUrl('assets/globe/logo.png')
    .backgroundColor('#F9FAFB')
    .width(1000)
    .height(1000)
    .pointOfView({ altitude: 3.5 })
    .customLayerData(gData)
    .customThreeObject(d => {
      const data = d as GlobeData;
      const texture = textures[Math.floor(Math.random() * textures.length)];
      return new THREE.Mesh(
        new THREE.BoxGeometry(data.radius * 2, data.radius * 2, data.radius * 2),
        new THREE.MeshLambertMaterial({ map: texture, color: 'white', side: undefined })
      );
    })
    .customThreeObjectUpdate((obj, d) => {
      const data = d as GlobeData;
      Object.assign(obj.position, myGlobe.getCoords(data.lat, data.lng, data.alt));
    });

  (function moveSpheres() {
    gData.forEach(d => (d.lat += 0.3));
    myGlobe.customLayerData(gData);
    requestAnimationFrame(moveSpheres);
  })();

  const globeControls = myGlobe(globeRefState).controls();
  globeControls.enableZoom = false; // Desactiva zoom
  globeControls.enableRotate = false; // Desactiva rotación manual
  globeControls.autoRotate = true; // Activa rotación automática

  return (
    <div className="flex w-dvw justify-center">
      <div className="flex flex-grow flex-col items-center justify-center">
        <h1 className="mb-2 text-center text-[32px] font-bold sm:text-[40px]">
          {' '}
          Your Hub for Intelligent SaaS Pricing{' '}
        </h1>
        <p className="mx-auto max-w-[640px] text-center text-lg leading-relaxed text-sphere-grey-600">
          {' '}
          Explore our suite of Pricing-driven tools and unleash the full potential of SaaS pricings{' '}
        </p>
        <div className="mt-5 flex min-w-[50%] justify-center">
          <button onClick={() => {router.push("/register")}} type="button" className="inline-flex items-center gap-2 rounded-md border border-sphere-primary-700 px-5 py-2 text-sphere-primary-700 transition-colors hover:bg-sphere-primary-700 hover:text-white">
            Get Started <FaPlayCircle />
          </button>
          {/* <Button onClick={() => {router.push("#about")}} variant="outlined" size='large' endIcon={<LanguageIcon />}>About SPHERE</Button> */}
        </div>
      </div>
      <div ref={globeRef} />
    </div>
  );
}
