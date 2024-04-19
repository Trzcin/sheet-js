import { useEffect, useState } from "react";

export function useModifierKeys() {
    const [modifiers, setModifiers] = useState<ModifierState>({shift: false});
    
    function keyDown(ev: KeyboardEvent) {
        setModifiers({
            shift: ev.shiftKey
        });
    }

    function keyUp(ev: KeyboardEvent) {
        setModifiers({
            shift: ev.shiftKey
        })
    }

    useEffect(() => {
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);
        
        return () => {
            window.removeEventListener('keydown', keyDown);
            window.removeEventListener('keyup', keyUp);
        }
    }, []);
    
    return modifiers;
}

export interface ModifierState {
    shift: boolean;
}