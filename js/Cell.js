class Cell {
    constructor(props) {
        this.props = props;
        this.createElement();
        this.render();
    }
    changeProps(newProps) {
        this.props = {
            ...this.props,
            ...newProps
        };
        this.render();
    }
    clickHandler(event) {
        if (this.props.canMove) {
            this.props.onMove(this);
        }
    }
    createElement() {
        this.element = createElement('div', {
            className: 'cell',
        }, this.props.number);
        this.element.addEventListener('click', this.clickHandler.bind(this));
    }
    render() {
        if (this.props.canMove) {
            this.element.classList.add('cell--can-move');
        } else {
            this.element.classList.remove('cell--can-move');
        }
        if (this.props.position) {
            this.element.style.left = this.props.position.cell * 25 + '%';
            this.element.style.top = this.props.position.row * 25 + '%';
        }

    }
}