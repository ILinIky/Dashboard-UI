import React, { StrictMode, useEffect, useRef, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement("main", null,
        React.createElement(IconSprites, null),
        React.createElement(Loading, null))));
function Icon({ icon, color }) {
    const colorClass = color ? ` icon--${color}` : "";
    return (React.createElement("svg", { className: `icon${colorClass}`, width: "16px", height: "16px", "aria-hidden": "true" },
        React.createElement("use", { href: `#${icon}` })));
}
function IconSprites() {
    const viewBox = "0 0 16 16";
    const emptyCircleRectAngles = [];
    const emptyCircleRectAngleCount = 16;
    for (let r = 0; r < emptyCircleRectAngleCount; ++r) {
        emptyCircleRectAngles.push(360 / emptyCircleRectAngleCount * r);
    }
    return (React.createElement("svg", { width: "0", height: "0", "aria-hidden": "true" },
        React.createElement("symbol", { id: "check-circle", viewBox: viewBox },
            React.createElement("circle", { fill: "currentcolor", cx: "8", cy: "8", r: "8" }),
            React.createElement("polyline", { fill: "none", stroke: "var(--bg)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", points: "4 8,7 11,12 5" })),
        React.createElement("symbol", { id: "empty-circle", viewBox: viewBox },
            React.createElement("defs", null,
                React.createElement("rect", { id: "empty-circle-rect", x: "-1", width: "2", height: "2" })),
            React.createElement("g", { fill: "currentcolor", transform: "translate(8,8)" }, emptyCircleRectAngles.map((rotation, i) => React.createElement("use", { key: i, href: "#empty-circle-rect", transform: `rotate(${rotation}) translate(0,6)` })))),
        React.createElement("symbol", { id: "half-circle", viewBox: viewBox },
            React.createElement("clipPath", { id: "half-circle-clip" },
                React.createElement("rect", { x: "8", y: "0", width: "8", height: "16" })),
            React.createElement("circle", { fill: "none", stroke: "currentcolor", strokeWidth: "2", cx: "8", cy: "8", r: "7" }),
            React.createElement("circle", { fill: "currentcolor", cx: "8", cy: "8", r: "5", clipPath: "url(#half-circle-clip)" }))));
}
function Loading() {
    const [step, setStep] = useState(0);
    const progressFrame = useRef(0);
    const steps = [
        {
            id: 0,
            state: "waiting",
            title: "Preparing"
        },
        {
            id: 1,
            state: "waiting",
            title: "Downloading",
            filesPreparedMax: 50
        },
        {
            id: 2,
            state: "waiting",
            title: "Analyzing",
            filesPreparedMax: 50
        },
        {
            id: 3,
            state: "waiting",
            title: "Creating"
        },
        {
            id: 4,
            state: "waiting",
            title: "Finalizing"
        },
    ];
    const stepCount = useRef(steps.length);
    const [stepObjects, setStepObjects] = useState(steps);
    const allStepsDone = step === stepCount.current;
    /**
     * Increment file preparation or set the state of a loading step.
     * @param item Loading step
     */
    function updatedItem(item) {
        const { id, state, start, filesPrepared, filesPreparedMax } = item;
        const updated = { id, state };
        if (!start) {
            updated.start = new Date();
            updated.state = "progress";
            // don’t proceed to file preparation if not applicable
            if (!filesPreparedMax)
                return updated;
        }
        if (filesPreparedMax) {
            // increment prepared files
            const prepared = filesPrepared === undefined ? -1 : filesPrepared;
            const preparedInc = 1;
            updated.filesPrepared = Math.min(prepared + preparedInc, filesPreparedMax);
        }
        if (!filesPreparedMax || updated.filesPrepared === filesPreparedMax) {
            // mark it done if no files to prepare or all files are prepared
            updated.finish = new Date();
            updated.state = "done";
        }
        return updated;
    }
    ;
    useEffect(() => {
        const updatePromise = async (delay = 0) => await new Promise((resolve) => {
            progressFrame.current = setTimeout(resolve, delay);
        }).then(() => {
            setStepObjects((prev) => prev.map((item) => {
                if (item.id !== step)
                    return item;
                const updated = updatedItem(item);
                if (updated.state === "done") {
                    clearTimeout(progressFrame.current);
                    setStep((step) => step + 1);
                }
                return Object.assign(Object.assign({}, item), updated);
            }));
            // loop
            if (step === 1 || step === 2)
                updatePromise(50);
            else if (step < stepCount.current)
                updatePromise(1500);
        });
        updatePromise();
        return () => clearTimeout(progressFrame.current);
    }, [step]);
    return (React.createElement("div", { className: `loading${allStepsDone ? " loading--done" : ""}` },
        React.createElement("div", { className: "loading__steps" }, stepObjects.map((s, i) => {
            const { state, title, start, finish, filesPrepared, filesPreparedMax } = s;
            let distance = i;
            if (allStepsDone) {
                // keep the middle step in the center
                distance -= Math.floor(stepCount.current / 2);
            }
            else {
                // allow waiting items to be slightly closer to each other
                let moveBy = step;
                if (i > step + 1) {
                    const stepHeight = 5.25;
                    moveBy += (i - (step + 1)) * (1.5 / stepHeight);
                }
                distance -= moveBy;
            }
            const fade = allStepsDone ? 0 : Math.abs(i - step);
            return React.createElement(LoadingStepBlock, { key: i, title: title, state: state, distance: distance, fade: fade, start: start, finish: finish, filesPrepared: filesPrepared, filesPreparedMax: filesPreparedMax });
        }))));
}
function LoadingEllipsis() {
    return (React.createElement("div", { className: "loading__ellipsis" },
        React.createElement("div", { className: "loading__ellipsis-dot" }, "."),
        React.createElement("div", { className: "loading__ellipsis-dot" }, "."),
        React.createElement("div", { className: "loading__ellipsis-dot" }, ".")));
}
function LoadingStepBlock({ state, title = "", distance = 0, fade = 0, start, finish, filesPrepared, filesPreparedMax = 0 }) {
    const stateMap = {
        waiting: "empty-circle",
        progress: "half-circle",
        done: "check-circle"
    };
    const colorMap = {
        waiting: "neutral",
        progress: "warning",
        done: "success"
    };
    const style = {
        opacity: 1 - fade * 0.225,
        transform: `translateY(${100 * distance}%)`
    };
    /**
     * Get a friendly-formatted date.
     * @param date Date
     */
    function dateFormatted(date) {
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "medium",
        }).format(date);
    }
    return (React.createElement("div", { className: `loading__step${state !== "waiting" ? " loading__step--in" : ""}`, style: style },
        React.createElement(Icon, { icon: stateMap[state], color: colorMap[state] }),
        React.createElement("div", null,
            React.createElement("div", { className: "loading__step-title" }, title),
            React.createElement("div", { className: "loading__step-info" },
                start ? `${dateFormatted(start)} — ` : "",
                finish ? dateFormatted(finish) : (state === "progress" ? React.createElement(LoadingEllipsis, null) : "")),
            React.createElement("div", { className: "loading__step-info" }, filesPrepared !== undefined ? `${filesPrepared} of ${filesPreparedMax} files prepared` : ""))));
}