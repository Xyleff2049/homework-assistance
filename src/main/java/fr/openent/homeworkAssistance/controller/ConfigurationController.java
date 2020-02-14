package fr.openent.homeworkAssistance.controller;

import fr.openent.homeworkAssistance.HomeworkAssistance;
import fr.openent.homeworkAssistance.security.UpdateConfigRight;
import fr.openent.homeworkAssistance.service.ConfigurationService;
import fr.openent.homeworkAssistance.service.impl.DefaultConfigurationService;
import fr.wseduc.rs.*;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import fr.wseduc.webutils.request.RequestUtils;

import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;

public class ConfigurationController extends ControllerHelper {

    private ConfigurationService configurationService;

    public ConfigurationController() {
        super();
        this.configurationService = new DefaultConfigurationService("homework-assistance");
    }

    @Get("/config")
    @ApiDoc("Get config")
    public void get(HttpServerRequest request) {
        configurationService.get(defaultResponseHandler(request));
    }

    @Put("/config")
    @ApiDoc("Update config")
    @SecuredAction(HomeworkAssistance.ADMIN)
    public void update(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, settings ->
                configurationService.update(defaultResponseHandler(request), settings));
    }

}