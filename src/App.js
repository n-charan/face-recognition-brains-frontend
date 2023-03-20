import './App.css';
import { Component } from 'react';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm';
import Rank from './components/rank/Rank';
import FaceRecognition from './components/faceRecognition/FaceRecognition';
import Register from './components/register/Register';
import ParticlesBg from 'particles-bg';
import SignIn from './components/signin/SignIn';

const returnClarafaiReturnOptions = (imageURL) => {
  const PAT = '14b2626e309e4ddc91338b8127b00974';
  const USER_ID = 'nnaveen';
  const APP_ID = 'face-recognition-brain';
  const IMAGE_URL = 'https://samples.clarifai.com/metro-north.jpg';

  const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
      ]
    });
  const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  return requestOptions;
}



class App extends Component {
  constructor( ) {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box : {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarafaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      lefCol: clarafaiFace.left_col * width,
      topRow: clarafaiFace.top_row * height,
      rightCol: width - (clarafaiFace.right_col * width),
      bottomRow: height - (clarafaiFace.bottom_row * height)
    }
  }

  diplayDetectionBox = (box) => {
    this.setState({ box : box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({imageURL: this.state.input})
    fetch("https://api.clarifai.com/v2/models/face-detection/outputs", returnClarafaiReturnOptions())
        .then(response => response.json())
        .then(result => {
          if (result) {
            fetch("http://localhost:8080/image", {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: this.state.user.id
               })
            })
            .then(resp => resp.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
              console.log(this.state.user);
            })
          }
        this.diplayDetectionBox(this.calculateFaceLocation(result))
        })
        .catch(error => console.log(error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn:false});
    } else if(route === 'home') {
      this.setState({isSignedIn:true});
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageURL, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="tadpole" bg={true} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} 
                        onPictureSubmit={this.onPictureSubmit} />
              <FaceRecognition box={box} imageUrl={imageURL}/>
            </div>
            : ( route === 'signin' 
                  ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                  : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
              )
        }
      </div>
    )
  }
}

export default App;
