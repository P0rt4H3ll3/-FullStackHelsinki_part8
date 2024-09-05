const Notify = ({ errorMessage }) => {
  const errorStyle = {
    color: 'red',
    backgroundColor: 'lightgrey',
    fontSize: 30,
    fontWeight: 700,
    fontStyle: 'oblique',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    border: '2px solid red', // Border around the text
    borderRadius: '8px',
    display: 'inline-block', // Ensures border is applied around the text
    padding: '4px 16px' // Padding: top-bottom  left-right
  }

  const successStyle = {
    color: 'green',
    backgroundColor: 'lightgreen',
    fontSize: 30,
    fontWeight: 700,
    fontStyle: 'oblique',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    border: '2px solid green', // Border around the text
    borderRadius: '8px',
    display: 'inline-block', // Ensures border is applied around the text
    padding: '4px 16px' // Padding: top-bottom  left-right
  }

  if (!errorMessage) {
    return null
  }

  return <div style={errorStyle}>{errorMessage}</div>
}

export default Notify
