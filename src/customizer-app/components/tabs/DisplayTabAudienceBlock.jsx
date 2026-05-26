/**
 * DisplayTabAudienceBlock — "Audience / User access" section of the Display tab.
 *
 * Pro feature (locked + badged in Lite). Per-bar conditional display by:
 *   - login state (logged-in / logged-out)
 *   - specific roles (checkbox list from boot.roles)
 *   - specific users (AsyncUserPicker)
 *
 * Mutually-exclusive modes via display.audience; roles/userIds hold the
 * selection for the 'roles' / 'users' modes respectively.
 */
import { RadioControl, CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { AsyncUserPicker } from '../fields/AsyncUserPicker';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const AUDIENCE_OPTIONS = [
	{ value: 'all', label: __( 'Everyone', 'notibar' ) },
	{ value: 'loggedin', label: __( 'Logged-in users', 'notibar' ) },
	{ value: 'loggedout', label: __( 'Logged-out visitors', 'notibar' ) },
	{ value: 'roles', label: __( 'Specific roles', 'notibar' ) },
	{ value: 'users', label: __( 'Specific users', 'notibar' ) },
];

function bootRoles() {
	const boot = window.njtNotibarBoot || {};
	return Array.isArray( boot.roles ) ? boot.roles : [];
}

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with the updated bar.
 */
export function DisplayTabAudienceBlock( { bar, onChange } ) {
	const pro = isProEdition();
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { display } = bar;
	const audience = display.audience || 'all';
	const roles = Array.isArray( display.roles ) ? display.roles : [];
	const userIds = Array.isArray( display.userIds ) ? display.userIds : [];

	function toggleRole( slug, checked ) {
		const next = checked
			? [ ...roles, slug ]
			: roles.filter( ( r ) => r !== slug );
		set( 'display.roles', next );
	}

	return (
		<fieldset className="njt-notibar-fieldset njt-notibar-audience-block">
			<legend className="njt-notibar-fieldset__legend">
				{ __( 'Audience', 'notibar' ) }
			</legend>

			{ ! pro && (
				<ProUpgradeNotice
					feature={ __(
						'Conditional display by role or user',
						'notibar'
					) }
				/>
			) }

			<div className={ pro ? undefined : 'njt-pro-locked' }>
				<RadioControl
					label={ __( 'Show this bar to', 'notibar' ) }
					selected={ audience }
					options={ AUDIENCE_OPTIONS }
					onChange={ ( v ) => set( 'display.audience', v ) }
				/>

				{ 'roles' === audience && (
					<div className="njt-notibar-audience-block__roles">
						{ bootRoles().map( ( role ) => (
							<CheckboxControl
								key={ role.slug }
								label={ role.label }
								checked={ roles.includes( role.slug ) }
								onChange={ ( checked ) =>
									toggleRole( role.slug, checked )
								}
							/>
						) ) }
					</div>
				) }

				{ 'users' === audience && (
					<AsyncUserPicker
						value={ userIds }
						onChange={ ( ids ) => set( 'display.userIds', ids ) }
					/>
				) }
			</div>
		</fieldset>
	);
}
