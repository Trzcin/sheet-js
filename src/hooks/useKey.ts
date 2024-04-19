import { useEffect } from "react";

export function useKey() {
    function keyDown(ev: KeyboardEvent) {

    }

    function keyUp(ev: KeyboardEvent) {

    }

    useEffect(() => {
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);
        
        return () => {
            window.removeEventListener('keydown', keyDown);
            window.removeEventListener('keyup', keyUp);
        };
    }, []);
}