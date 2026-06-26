/**
 * DynamicTagPicker — "Insert variable" button that opens a popover menu of
 * dynamic content tokens, grouped by category. On select, calls onInsert with
 * the chosen {token} string (the caller appends it to its field). Pro-gated:
 * the button is disabled in Lite. Reused by ContentTab for the desktop and
 * mobile text fields.
 *
 * MIRROR: includes/NotificationBar/DynamicContent.php BUILTIN_NAMES — keep these
 * token strings in lockstep with the PHP registry. `perVisitor` groups
 * personalize per visitor (cache-sensitive behind full-page cache).
 */
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const DYNAMIC_TAG_GROUPS = [
	{
		label: __( 'Visitor', 'notibar' ),
		perVisitor: true,
		tags: [
			{
				token: '{user_first_name}',
				label: __( 'First name', 'notibar' ),
			},
			{ token: '{user_last_name}', label: __( 'Last name', 'notibar' ) },
			{
				token: '{user_display_name}',
				label: __( 'Display name', 'notibar' ),
			},
			{ token: '{user_role}', label: __( 'Role', 'notibar' ) },
			{ token: '{visitor_country}', label: __( 'Country', 'notibar' ) },
		],
	},
	{
		label: __( 'Date & time', 'notibar' ),
		tags: [
			{ token: '{current_date}', label: __( 'Date', 'notibar' ) },
			{ token: '{current_time}', label: __( 'Time', 'notibar' ) },
			{ token: '{current_day}', label: __( 'Weekday', 'notibar' ) },
			{ token: '{current_month}', label: __( 'Month', 'notibar' ) },
			{ token: '{current_year}', label: __( 'Year', 'notibar' ) },
		],
	},
	{
		label: __( 'Site', 'notibar' ),
		tags: [
			{ token: '{site_name}', label: __( 'Site name', 'notibar' ) },
			{ token: '{site_tagline}', label: __( 'Tagline', 'notibar' ) },
			{ token: '{users_count}', label: __( 'Users count', 'notibar' ) },
			{ token: '{posts_count}', label: __( 'Posts count', 'notibar' ) },
		],
	},
	{
		label: __( 'Current post', 'notibar' ),
		tags: [
			{ token: '{post_title}', label: __( 'Title', 'notibar' ) },
			{ token: '{post_author}', label: __( 'Author', 'notibar' ) },
			{ token: '{post_category}', label: __( 'Category', 'notibar' ) },
			{ token: '{post_date}', label: __( 'Published date', 'notibar' ) },
		],
	},
	{
		label: __( 'WooCommerce', 'notibar' ),
		perVisitor: true,
		tags: [
			{
				token: '{recently_viewed_product}',
				label: __( 'Recently viewed product', 'notibar' ),
			},
		],
	},
];

/**
 * @param {Object}   props
 * @param {boolean}  [props.withHelp] Show the Pro notice (Lite) + syntax help line.
 *                                    Use on the primary (desktop) field only to
 *                                    avoid duplicating the notice/help.
 * @param {Function} props.onInsert   Called with the chosen token string.
 */
export function DynamicTagPicker( { withHelp = false, onInsert } ) {
	const pro = isProEdition();

	return (
		<div className="njt-notibar-dynamic-tags">
			{ withHelp && ! pro && (
				<ProUpgradeNotice
					feature={ __( 'Dynamic content tags', 'notibar' ) }
				/>
			) }
			<Dropdown
				className="njt-notibar-dynamic-tags__dropdown"
				contentClassName="njt-notibar-dynamic-tags__popover"
				popoverProps={ { placement: 'bottom-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						variant="secondary"
						size="small"
						icon="shortcode"
						onClick={ onToggle }
						aria-expanded={ isOpen }
						disabled={ ! pro }
					>
						{ __( 'Insert variable', 'notibar' ) }
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<div
						className="njt-notibar-dynamic-tags__menu"
						style={ { maxHeight: 320, overflowY: 'auto' } }
					>
						{ DYNAMIC_TAG_GROUPS.map( ( group ) => (
							<MenuGroup
								key={ group.label }
								label={
									group.perVisitor
										? sprintf(
												/* translators: %s: token group name. */
												__(
													'%s (per visitor)',
													'notibar'
												),
												group.label
										  )
										: group.label
								}
							>
								{ group.tags.map( ( tag ) => (
									<MenuItem
										key={ tag.token }
										onClick={ () => {
											onInsert( tag.token );
											onClose();
										} }
									>
										{ tag.label }
									</MenuItem>
								) ) }
							</MenuGroup>
						) ) }
					</div>
				) }
			/>
			{ withHelp && (
				<p className="njt-notibar-dynamic-tags__help">
					{ __(
						'Insert a variable to show live values. Add a fallback with a pipe, e.g. {user_first_name|there}. Per-visitor variables should not be used on fully cached pages.',
						'notibar'
					) }
				</p>
			) }
		</div>
	);
}
