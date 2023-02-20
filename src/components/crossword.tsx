import { FunctionComponent, useState } from 'react';
import { Range } from "@/utils";
import { Cell } from "@/components/cell";
import { cloneDeep } from 'lodash';

type CrosswordSchema = {
    gridSize: [number, number]
}

// Format: (rowidx, colidx): value
type CrosswordFilling = {
    [key: string]: number
};

type CrosswordProps = {
    schema: CrosswordSchema
}

const cellKey = (colidx: number, rowidx: number) => {
    return `${colidx},${rowidx}`;
}

export const Crossword: FunctionComponent<CrosswordProps> = ({ schema }) => {
    const [currFilling, setCurrFilling] = useState<CrosswordFilling>({});
    
    const onUpdate = (rowidx: number, colidx: number, value?: number) => {
        setCurrFilling(s => {
            let s2 = cloneDeep(s);
            if(value === undefined) {
                delete s2[cellKey(rowidx, colidx)];
            } else {
                s2[cellKey(rowidx, colidx)] = value;
            }
            return s2;
        });
    };

    return (
        <div className={`grid p-8 gap-4 grid-cols-${schema.gridSize[1]}`}>
            {Range(schema.gridSize[0]).map((rowidx) => 
                    Range(schema.gridSize[1]).map((colidx) => <Cell key={cellKey(rowidx, colidx)}
                        value={currFilling[cellKey(rowidx, colidx)]} onUpdate={(value) => {
                        onUpdate(rowidx, colidx, value);
                    }} />)
            ).flat()}
        </div>
    );
}