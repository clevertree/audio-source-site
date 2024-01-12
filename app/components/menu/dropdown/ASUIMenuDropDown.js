import PropTypes from "prop-types";
import ASUIClickableDropDown from "../../clickable/ASUIClickableDropDown";

import "./ASUIMenuDropDown.css";

export default class ASUIMenuDropDown extends ASUIClickableDropDown {

    // Default Properties
    static defaultProps = {
        arrow:          true,
        vertical:       false,
        // openOverlay:    false
    };

    // Property validation
    static propTypes = {
        options: PropTypes.any.isRequired,
    };

    getClassName() { return super.getClassName() + ' asui-menu-item'; }
}
