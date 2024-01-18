import './Robot.css';

function Robot({x, y, blockSize, color}) {
    return (
        <div
            className='robot'
            style={{
                left: x*blockSize + 6 + 'px',
                top: y*blockSize + 6 + 'px',
                backgroundColor: color,
            }}>

        </div>
    )
}

export default Robot;