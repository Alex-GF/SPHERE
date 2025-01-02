Este trabajo de carácter metodológico establece directrices y buenas prácticas para modelar utilizando Pricing2Yaml. Estas guías serán esenciales para abordar el "process engine", la fase posterior a la extracción de precios. Se propone aplicar estas prácticas sobre el dataset de 162 precios (ICSOC24) e identificar posibles mejoras en la sintaxis. De ser viables, dichas mejoras se implementarían durante el desarrollo del proyecto.

## Desglose de acciones:

-	Identificar estrategias y patrones recurrentes en el modelado de iPricings utilizando la sintaxis de Pricing2Yaml.
-	Extraer mejoras para la sintaxis y, si es posible, implementar una actualización.
-	Versionar la sintaxis para permitir la coexistencia de diferentes versiones, facilitando la evolución de los iPricings (p.ej., con un atributo que indique la versión en el yaml).
-	Actualizar el dataset de 162 precios siguiendo las buenas prácticas y la última versión de la sintaxis.

## Finalidad:

El objetivo es unificar y estandarizar el modelado de los iPricings con Pricing2Yaml, mejorando la sintaxis y eliminando elementos innecesarios. Esto facilitará el desarrollo de herramientas automatizadas como AI4Pricing2Yaml. En SPHERE, podría ser útil incluir un parámetro que permita seleccionar la versión específica de Pricing2Yaml a utilizar, asegurando la compatibilidad entre versiones antiguas y nuevas de iPricings.
