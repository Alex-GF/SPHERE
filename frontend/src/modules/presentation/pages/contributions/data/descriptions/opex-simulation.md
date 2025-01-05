En este trabajo se busca trabajar en una extensión de Pricing2Yaml que permita asociar un coste de operación a cada característica, con idea de poder calcular el OpEx asociado a la subscripción de cada usuario. Esta cuantía debe ser calculada en base a factores como los servicios externos necesarios para ofrecer la funcionalidad, el coste interno que conlleva mantener la funcionalidad, e.g. IoT simulations, etc. Una vez completada esta primera fase, el alumno puede extender la versión base del editor de SPHERE para que la pricing card del pricing muestre en tiempo real, conforme el pricing se modifica, el OpEX aproximado asociado a la configuración. De esta forma, el prosumer puede validar mientras distribuye las features y ajusta los valores de los límites de uso del pricing que los planes/add-ons no generarán pérdidas por un mal ajuste de los precios.

## Desglose de acciones:

-	Diseñar la propuesta de extensión para Pricing2Yaml que modele el coste asociado a cada feature.
-	Implementar la propuesta de extensión para Pricing2Yaml en Pricing4Java y Pricing4TS.
-	Actualizar la documentación de Pricing2Yaml.
-	Actualizar la UI del editor de planes de precios en SPHERE para que la pricing card incluya el coste del opex asociado al pricing que se está modelando. Esta operación no consiste en más que sumar todos los precios asociados a las características del pricing y mostrarlo en la pricing card.

## Finalidad:

El objetivo es que el editor de planes de precios de SPHERE muestre cada vez más información sobre el pricing que se está modelando. Además, de esta forma, durante la fase de diseño, el prosumer se ve obligado a evaluar el coste operativo asociado a cada característica antes de decidir si vale la pena invertir tiempo en su implementación, algo fundamental para minimizar los errores durante la gestión de un SaaS.
