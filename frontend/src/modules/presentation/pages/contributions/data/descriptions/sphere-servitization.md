Este trabajo puramente técnico consiste en transformar SPHERE en un SaaS que ofrezca todas las herramientas de la suite Pricing4SaaS de forma centralizada. Entre las tareas, se propone pricificar SPHERE, diseñar vistas principales del sistema (login/registro, gestión de proyecctos de pricings, búsqueda y filtrado de elementos, etc) y prepararlo para despliegue en IaaS/PaaS.

## Desglose de acciones:
-	Diseñar un plan de precios para SPHERE.
-	Diseñar e implementar las siguientes vistas dentro de SPHERE:
    -   Buscador de elementos (pricings, papers, trabajos, herramientas, etc)
    -	Login/Register
    -   Perfil (consulta / edición)
    -   Gestión de pricings (crear, consultar, editar, borrar)
-	Implementar en el backend toda la lógica correspondiente a la gestión de usuarios y a las funcionalidades ya implementadas en cliente.
-	Hacer SPHERE pricing-driven usando la suite de Pricing4SaaS, i.e., Pricing4React y Pricing4TS.
-	Crear una imagen docker de SPHERE
-	**EXTRA:** desarrollar una extensión a la funcionalidad del editor de pricings que permita a los usuarios guardar sus pricings diseñados como proyectos en los que trabajar de forma iterativa (o incluso colaborativa) con otro miembros de su organización.

## Finalidad:

El objetivo es tener un producto software desplegado como SaaS que permita gestionar de forma eficiente a un número concurrente de usuarios, de tal forma que éstos utilicen SPHERE como una herramienta clave a la hora de gestionar sus productos dirigidos por planes de precios y desplegados como SaaS.
