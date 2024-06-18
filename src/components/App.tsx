import '../css/App.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-simple-keyboard/build/css/index.css'

import Arcade from './pages/arcade/Arcade';

const App = () => {
  return (
      <div className='app'>
        <Arcade />
      </div>
  )
};

export default App;
