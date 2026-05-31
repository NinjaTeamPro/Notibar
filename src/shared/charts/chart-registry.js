/**
 * Chart.js tree-shaken registration.
 *
 * Import this once (side-effect) before rendering any chart. We register ONLY
 * the controllers/elements/scales/plugins the three charts need — never
 * `chart.js/auto`, which would pull the whole library into the lazy chunk.
 *
 * Charts used: Line (trend), Bar (per-bar comparison), Doughnut (breakdown).
 */
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Filler,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Filler,
	Tooltip,
	Legend
);

export { ChartJS };
