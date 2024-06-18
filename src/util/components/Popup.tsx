import { Popup as SPopup, StrictPopupProps } from "semantic-ui-react";

const Popup = ({ autoNoFilter = true,  ...props}: StrictPopupProps & { autoNoFilter?: boolean }) => {
    const popper = !autoNoFilter ? props.popper : { style: { filter: 'none' } }
    return (
        <SPopup 
            {...props}
            popper={popper}
        />
    )
}

Popup.Content = SPopup.Content;
Popup.Header = SPopup.Header;

export default Popup;