import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title ? `${title} | CS2 Tournaments` : 'CS2 Tournaments';

        return () => {
            document.title = prevTitle;
        };
    }, [title]);
};

export default usePageTitle;
