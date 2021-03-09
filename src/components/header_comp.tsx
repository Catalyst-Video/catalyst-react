import React, { useState } from "react";
import logo from "../assets/img/wordmark_logo.png";
// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
const HeaderComponent = ({ sessionKey }: { sessionKey: string }) => {
	const [showSessionDetails, setShowSessionDetails] = useState(false);

	return (
		<>
			<div id="header" className="notSelectable">
				<button
					className="header-btn"
					style={{ display: "inline" }}
					onClick={() => setShowSessionDetails(!showSessionDetails)}
				>
					<img src={logo} alt="Catalyst Logo" height="48" draggable="false" />
				</button>
			</div>
			{showSessionDetails && (
				<button
					className="session-details-btn"
					onClick={() => setShowSessionDetails(!showSessionDetails)}
				>
					<span className="session-details-title">
						<strong>Session Details</strong>
						<FontAwesomeIcon
							icon={faTimes}
							size="lg"
							title="Close Session Details"
							className="session-details-close"
						/>
					</span>
					Session Key:<i> {sessionKey}</i>
					<br />
					Host:<i> {sessionKey}</i>
					<br />
					IP:<i> {sessionKey}</i>
					<br />
					UUID:<i> {sessionKey}</i>
				</button>
			)}
		</>
	);
};

export default HeaderComponent;
