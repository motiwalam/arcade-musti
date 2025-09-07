export interface BackgroundCellProps {
    invisible?: boolean;
    roundedCorners: {
        topLeft: boolean;
        topRight: boolean;
        bottomLeft: boolean;
        bottomRight: boolean;
    };
}

const BackgroundCell = ({ invisible, roundedCorners }: BackgroundCellProps) => {
    // if there is no parent region, render a hidden cell
    if (invisible) {
        return <div className="invisible aspect-square" />;
    }

    const borderClasses = (
        (roundedCorners.topLeft ? "after:rounded-tl-lg " : "") +
        (roundedCorners.topRight ? "after:rounded-tr-lg " : "") +
        (roundedCorners.bottomLeft ? "after:rounded-bl-lg " : "") +
        (roundedCorners.bottomRight ? "after:rounded-br-lg " : "")
    );

    return (
        <div className={`
            aspect-square relative flex
            items-center justify-center
            ${borderClasses}
            after:absolute
            after:aspect-square
            after:bg-[#d9bdb3]
            after:size-[calc(100%_+_0.5em)]
            after:z-[0]
            
            before:aspect-square
            before:absolute
            before:bg-[#e1cbc5]
            before:size-[95%]
            before:z-[1]
            before:rounded-lg
        `}>
        </div>
    );
}

export default BackgroundCell;
