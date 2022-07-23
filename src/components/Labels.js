import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'

const initialFormData = Object.freeze({
    location: '',
    all: '',
    density: '',
    attentive: '',
    head: false,
    eyes: false,
    mouth: false,
    facial_expression: false,
    arms: false,
    l_hand: false,
    r_hand: false,
    legs: false,
    feet: false,
    age: 0,
    sex: '',
    occupation: '',
    posture: ''
});

export default function Labels(props) {

    const [formData, setFormData] = useState(initialFormData)

    const getFormData = (event) => {
        event.preventDefault()
        console.log(formData)
        props.passData(formData)
    }

    const handleChange = (event) => {
        if (event.target.name === 'density') {
            setFormData({
                ...formData,
                density : event.target.value
            })
        } else if (['head', 'eyes', 'mouth', 'facial_expression', 'arms', 'l_hand', 'r_hand', 'legs', 'feet'].includes(event.target.name)) {
            setFormData({
                ...formData,
                [event.target.name] : !formData[event.target.name]
            })
        } else if (event.target.name === 'sex') {
            setFormData({
                ...formData,
                [event.target.name] : event.target.value
            })
        } else {
            setFormData({
                ...formData,
                [event.target.name] : event.target.value
            });
        }
        // console.log(event.target.name)
        // console.log(formData);
    }

    return (
        <div className='labels'>
            <Form onSubmit={getFormData}>
                <Form.Group className="location">
                    <Form.Label className='category'>Location</Form.Label>
                    <Form.Control type="input" placeholder="Enter a location"
                        name='location'
                        value={formData.location}
                        onChange={handleChange}/> {/* location input */}
                </Form.Group>
                <Form.Group className="spectators">
                    <Form.Label className='category'>Spectators</Form.Label>
                    <div className='spec'>
                        <Form.Label>All</Form.Label>
                        <Form.Control type="input" placeholder="Enter a number"
                        name='all'
                        value={formData.all}
                        onChange={handleChange}/> 
                    </div>
                    <div className='spec'>
                        <Form.Label>Density</Form.Label>
                        <div>
                            <Form.Check inline label="none" name="density" type='radio' value={'None'} onChange={handleChange}/>
                            <Form.Check inline label="sparse" name="density" type='radio' value={'Sparse'} onChange={handleChange}/>
                            <Form.Check inline label="dense" name="density" type='radio' value={'Dense'} onChange={handleChange}/>
                        </div>
                    </div>
                    <div className='spec'>
                        <Form.Label>Attentive</Form.Label>
                        <Form.Control type="input" placeholder="Enter a number" name='attentive' onChange={handleChange}/>
                    </div>
                </Form.Group>
                <Form.Group className="modality">
                    <Form.Label className='category'>Modality</Form.Label>
                    <Form.Check label="Head" name="head" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="Eyes" name="eyes" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="Mouth" name="mouth" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="Facial Expression" name="facial_expression" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="Arms" name="arms" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="L Hand" name="l_hand" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="R Hand" name="r_hand" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="Legs" name="legs" type='checkbox' onChange={handleChange}/>
                        <Form.Check label="Feet" name="feet" type='checkbox' onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="demographic">
                    <Form.Label className='category'>Demographic</Form.Label>
                    <div className='demo'>
                        <Form.Label>Age</Form.Label>
                        <Form.Control type="input" placeholder="Numerical Age" name='age' onChange={handleChange}/>
                    </div>
                    <div className='demo'>
                        <Form.Label>Sex</Form.Label>
                        <div>
                            <Form.Check inline label="Male" name="sex" type='radio' value={'Male'} onChange={handleChange}/>
                            <Form.Check inline label="Female" name="sex" type='radio' value={'Female'} onChange={handleChange}/>
                        </div>
                    </div>
                    <div className='demo'>
                        <Form.Label>Occupation</Form.Label>
                        <Form.Control type="input" placeholder="Optional" name='occupation' onChange={handleChange}/>
                    </div>
                </Form.Group>
                <Form.Group className="posture">
                    <Form.Label className='category'>Posture</Form.Label>
                    <Form.Control type="input" placeholder="Enter a posture (e.g. sitting)" name='posture' onChange={handleChange}/>
                </Form.Group>
                <div className='text-center'>
                    <Button variant="outline-success" type="submit">
                        Add Labels
                    </Button>
                </div>
            </Form>
        </div>
    )
}
