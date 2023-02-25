import { FunctionComponent, useCallback } from 'react';
import styles from '@/styles/cell.module.css';

type CellProps = {
    rowidx: number,
    colidx: number,
    value: number | undefined,
    onUpdate: (rowidx: number, colidx: number, value?: number) => void,
    onClick: (rowidx: number, colidx: number) => void,
    state: CellState
}

export enum CellState {
    INVALID = 0,
    INACTIVE,
    ACTIVE_WORD,
    ACTIVE_LETTER
}

const colors: { [key in CellState]: string } = {
    [CellState.INVALID]: "black",
    [CellState.INACTIVE]: "bg-slate-100",
    [CellState.ACTIVE_WORD]: "bg-amber-200",
    [CellState.ACTIVE_LETTER]: "bg-amber-400",
}

const hoverColors: { [key in CellState]: string } = {
    [CellState.INVALID]: "black",
    [CellState.INACTIVE]: "bg-slate-200",
    [CellState.ACTIVE_WORD]: "bg-slate-300",
    [CellState.ACTIVE_LETTER]: "bg-slate-400",
}

export const Cell: FunctionComponent<CellProps> = ({ rowidx, colidx, value, state, onUpdate, onClick }) => {
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value === "") {
            onUpdate(rowidx, colidx, undefined);
            return;
        }
        let parsed = parseInt(e.target.value);
        if(CELL_MATCH.test(e.target.value) && !isNaN(parsed)) {
            onUpdate(rowidx, colidx, parsed);
        }
    }, [rowidx, colidx, onUpdate]);

    const onSelect = useCallback(() => {
        onClick(rowidx, colidx);
    }, [rowidx, colidx, onClick]);

    return (
        <div
            className={classNames(styles.square, "rounded-sm border-2 place-content-center")}
        >
            {state !== CellState.INVALID && <input pattern={CELL_MATCH.toString()}
                className={classNames(styles.square, "w-full h-full text-center", 
                    colors[state], "hover:" + hoverColors[state] + " hover:cursor-pointer"
                )}
                value={value ?? ""} onChange={onChange} onClick={onSelect}
            ></input> }
        </div>
    );
}
