import React from "react";
import PropTypes from "prop-types";

import "./Display.css";
import User from "./User";
import Polls from "./Polls";
import NewPoll from "./NewPoll";
import GroupAdmin from "./GroupAdmin";

export default class Display extends React.Component {
    static propTypes = {
        viewName: PropTypes.string,
        user_first_name: PropTypes.string
    };

    render() {
        if (this.props.viewName === "REGISTER/LOGIN") {
            return (
                <User className="component-user"/>
            );
        }
        if (this.props.viewName === "GROUPS/ADMINS") {
            return (
                <GroupAdmin className="component-group-admin"/>
            );
        }
        if (this.props.viewName === "POLLS") {
            return (
                <Polls/>
            );
        }
        if (this.props.viewName === "NEW POLL") {
            return (
                <NewPoll/>
            );
        }
        return (
            <div className="component-display-default">
                <div>
                    Hello {this.props.user_first_name}
                </div>
                <div>
                    Please register or login
                </div>
            </div>
        );
    }
}
