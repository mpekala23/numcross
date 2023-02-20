import { FunctionComponent } from 'react';
import styles from '@/styles/cell.module.css';
import classNames from "classnames";
import { CELL_MATCH } from '@/consts';

type CellProps = {
    value: number | undefined,
    onUpdate: (value?: number) => void
}

export const Cell: FunctionComponent<CellProps> = ({ value, onUpdate }) => {
    console.log(value);

    return (
        <div
            className="grid w-full rounded-sm border-2 place-content-center"
        >
            <input pattern={CELL_MATCH.toString()} className={classNames(styles.square, "w-full bg-slate-100 hover:bg-slate-200 text-center hover:cursor-pointer")} value={value ?? ""} onChange={(e) => {
                if(e.target.value === "") {
                    onUpdate(undefined);
                    return;
                }
                let parsed = parseInt(e.target.value);
                console.log(parsed, CELL_MATCH.test(e.target.value));
                if(CELL_MATCH.test(e.target.value) && !isNaN(parsed)) {
                    onUpdate(parsed);
                }
            }}></input>
        </div>
    );
}