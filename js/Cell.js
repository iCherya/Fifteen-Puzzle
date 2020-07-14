class Cell {
    constructor(props) {
        this.props = props;
        this.createElement();
        this.render();
    }
    createElement() {
        this.element = createElement('div', {
            className: 'cell',
        }, this.props.number);
    }
    render() {
        if (this.props.canMove) {
            this.element.classList.add('cell--can-move');
        } else {
            this.element.classList.remove('cell--can-move');
        }
        this.element.style.left = this.props.position.cell * 25 + '%';
        this.element.style.top = this.props.position.row * 25 + '%';
    }
}