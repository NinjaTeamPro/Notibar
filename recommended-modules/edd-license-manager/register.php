<?php

defined( 'ABSPATH' ) || exit;

// Bump version on every init.php behavior change. Newest wins across consumers.
\YayRecommendedModules\Registry::register(
	'edd-license-manager',
	'1.10.0',
	__DIR__ . '/init.php'
);
