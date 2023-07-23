import { useEffect, useState, ReactNode } from 'react';

interface ClientSideRenderedComponentProps{
    children:ReactNode;
}

export const ClientSideRenderedComponent: React.FC<ClientSideRenderedComponentProps> = (props:ClientSideRenderedComponentProps) =>{
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    setShowComponent(true); // Set to true after the initial render to trigger the client-side rendering.
  }, []);

  return (
    <div>
      {showComponent && props.children}
    </div>
  );
}


