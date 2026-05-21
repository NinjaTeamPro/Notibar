/**
 * ContrastWarning — inline WCAG AA contrast notice.
 *
 * Renders a warning Notice when the contrast ratio between two hex colours
 * drops below 4.5:1 (WCAG 2.1 AA for normal text). Renders nothing when
 * the pair is accessible.
 *
 * Required at release per resolved-decisions §8.
 */
import { Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { contrastRatio } from '../../utils/wcag-contrast';

/**
 * @param {Object} props
 * @param {string} props.bg          Background colour hex (e.g. '#9af4cf').
 * @param {string} props.fg          Foreground colour hex (e.g. '#1919cf').
 * @param {string} [props.pairLabel] Human-readable pair name for the message.
 */
export function ContrastWarning( { bg, fg, pairLabel = '' } ) {
	const ratio = contrastRatio( bg, fg );

	if ( ratio >= 4.5 ) {
		return null;
	}

	const message = pairLabel
		? sprintf(
				/* translators: 1: contrast ratio value, 2: colour pair label */
				__(
					'Contrast %1$s:1 below WCAG AA (4.5:1) (%2$s) — text may be hard to read.',
					'notibar'
				),
				ratio.toFixed( 2 ),
				pairLabel
		  )
		: sprintf(
				/* translators: 1: contrast ratio value */
				__(
					'Contrast %1$s:1 below WCAG AA (4.5:1) — text may be hard to read.',
					'notibar'
				),
				ratio.toFixed( 2 )
		  );

	return (
		<Notice
			className="njt-notibar-contrast-warning"
			status="warning"
			isDismissible={ false }
		>
			{ message }
		</Notice>
	);
}
