import '../css/App.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-simple-keyboard/build/css/index.css'

import Arcade from './pages/arcade/Arcade';
import { Header } from 'semantic-ui-react';

const App = () => {
  return (
      <div className='app'>
         <Header dividing textAlign="center" as='h1'>Welcome to Arcade Musti!</Header>
        <Arcade />
      </div>
  )
};

export default App;
