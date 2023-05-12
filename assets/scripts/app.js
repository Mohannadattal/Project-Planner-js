class DOMHelper {
  static clearEventListener(element) {
    const cloneElement = element.cloneNode(true);
    element.replaceWith(cloneElement);
    return cloneElement;
  }
  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
  }
}

class Tooltip {
  constructor(closeNotifierFunction) {
    this.closeNotifier = closeNotifierFunction;
  }
  closeToolTip = () => {
    this.detach();
    this.closeNotifier();
  };

  detach() {
    this.element.remove();
    //this.element.parentElement.removeChild(this.element)
  }
  attach() {
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'card';
    tooltipElement.textContent = 'DUMMY!';
    tooltipElement.addEventListener('click', this.closeToolTip);
    this.element = tooltipElement;
    document.body.append(tooltipElement);
  }
}

class ProjectItem {
  hasActiveToolTip = false;
  constructor(id, updateProjectListsFunction, type) {
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunction;
    this.connectSwitchButton(type);
    this.connectMoreInfoButton();
  }

  showMoreInfoHandler() {
    if (this.hasActiveToolTip) {
      return;
    }
    const tooltip = new Tooltip(() => {
      this.hasActiveToolTip = false;
    });
    tooltip.attach();
    this.hasActiveToolTip = true;
  }

  connectMoreInfoButton() {
    const prjItemElement = document.getElementById(this.id);
    const moreInfoBtn = prjItemElement.querySelector('button:first-of-type');
    moreInfoBtn.addEventListener('click', this.showMoreInfoHandler);
  }

  connectSwitchButton(type) {
    const prjItemElement = document.getElementById(this.id);
    let switchBtn = prjItemElement.querySelector('button:last-of-type');
    switchBtn = DOMHelper.clearEventListener(switchBtn);
    switchBtn.textContent = type === 'active' ? 'Finish' : 'Active';
    switchBtn.addEventListener(
      'click',
      this.updateProjectListsHandler.bind(null, this.id)
    );
  }

  update(updateProjectListFn, type) {
    this.updateProjectListsHandler = updateProjectListFn;
    this.connectSwitchButton(type);
  }
}

class ProjectList {
  projects = [];
  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(
        new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
      );
    }
    console.log(this.projects);
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) {
    console.log(project);
    this.projects.push(project);
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projectId) {
    // const projectIndex = this.projects.findIndex((p) => p.id === projectId);
    // this.projects.splice(projectIndex, 1);

    this.switchHandler(this.projects.find((p) => p.id === projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  static init() {
    const activeProjectList = new ProjectList('active');
    const finishedProjectList = new ProjectList('finished');
    activeProjectList.setSwitchHandlerFunction(
      finishedProjectList.addProject.bind(finishedProjectList)
    );
    finishedProjectList.setSwitchHandlerFunction(
      activeProjectList.addProject.bind(activeProjectList)
    );
  }
}

App.init();
