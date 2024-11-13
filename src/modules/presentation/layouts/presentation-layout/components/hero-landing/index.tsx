import Globe from 'globe.gl';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/system';
import * as THREE from 'three';
import { Button, Typography } from '@mui/material';
import { flex } from '../../../../../core/theme/css';

export default function HeroLanding() {
  const myGlobe = Globe();
  const globeRef = useRef<HTMLDivElement>(null);
  const [globeRefState, setGlobeRefState] = useState<HTMLDivElement>(
    globeRef.current ?? document.createElement('div')
  );

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
    new THREE.TextureLoader().load('assets/globe/microsoft.png'),
    new THREE.TextureLoader().load('assets/globe/github.png'),
    new THREE.TextureLoader().load('assets/globe/buffer.svg'),
    new THREE.TextureLoader().load('assets/globe/clockify.svg'),
    new THREE.TextureLoader().load('assets/globe/jira.png'),
    new THREE.TextureLoader().load('assets/globe/overleaf.png'),
    new THREE.TextureLoader().load('assets/globe/slack.png'),
    new THREE.TextureLoader().load('assets/globe/zoom.png'),
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
    <Box sx={{ width: '100dvw', ...flex({}) }}>
      <Box sx={{ ...flex({ direction: 'column' }), flexGrow: 1 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: 32, sm: 40 },
          }}
        >
          {' '}
          Your Hub for Intelligent SaaS Pricing{' '}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{
            maxWidth: 'sm',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          {' '}
          Explore our suite of Pricing-driven tools and unleash the full potential of SaaS pricings{' '}
        </Typography>
        <Box sx={{ minWidth: '50%', ...flex({ justify: 'space-between' }) }}>
          <Button variant="contained">Get Started</Button>
          <Button variant="outlined">About SPHERE</Button>
        </Box>
      </Box>
      {/* <Box ref={globeRef} /> */}
    </Box>
  );
}
