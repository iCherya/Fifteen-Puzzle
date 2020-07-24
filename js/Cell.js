class Cell {
    constructor(props, container, gameLevel) {
        this.props = props;
        this.gameLevel = gameLevel;
        this.createElement(container, gameLevel);
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
    createElement(container, gameLevel) {
        let containerWidth = container.offsetWidth;
        let cellWidth = (((containerWidth - gameLevel) / gameLevel - 4) / containerWidth) * 100;

        this.element = createElement('div', {
            className: 'cell',
        }, this.props.number);
        this.element.addEventListener('click', this.clickHandler.bind(this));

        this.element.style.width = `${cellWidth}%`;
        this.element.style.height = `${cellWidth}%`;
        this.element.style.fontSize = `${cellWidth*5}%`;

    }
    render() {
        if (this.props.canMove) {
            this.element.classList.add('cell--can-move');
        } else {
            this.element.classList.remove('cell--can-move');
        }
        if (this.props.position) {
            this.element.style.left = this.props.position.cell * (100 / this.gameLevel) + '%';
            this.element.style.top = this.props.position.row * (100 / this.gameLevel) + '%';
        }

    }
}